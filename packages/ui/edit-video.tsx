import { View, Text, ScrollView, TouchableOpacity, Image, Dimensions, StyleSheet, Alert } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { getRawAIVideo } from '@supabase';
import Purchases from 'react-native-purchases';
import { useVideoPlayer, VideoView } from 'expo-video';
import axios from 'axios';
import { useColorScheme } from '@hooks/useColorScheme';
import { AntDesign } from '@expo/vector-icons';
import { useOfferings } from '@hooks/useOfferings';
import { useSubscriptionStatus } from '@hooks/useSubscriptionStatus';

const WM = {
  pickleball: require('@assets/images/watermark-pickleball.png'),
  tennis:     require('@assets/images/watermark-tennis.png'),
} as const;

export default function EditVideo({
  sport
}){
  const offerings = useOfferings(sport);
  const isSubscribed = useSubscriptionStatus(sport);
  const colorScheme = useColorScheme();
  const darkMode = colorScheme == "dark";

  const { video_id, email } = useLocalSearchParams();
  const [playbackId, setPlaybackId] = useState("");
  const [videoDimensions, setVideoDimensions] = useState({ width: 0, height: 0 });
  const [height, setHeight] = useState(0);
  const [width, setWidth] = useState(0);
  const [rawMiniClips, setRawMiniClips] = useState([]);
  const [selectedClip, setSelectedClip] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [exported, setExported] = useState(false);
  const [isFastForward, setIsFastForward] = useState(false);
  const [showWatermark, setShowWatermark] = useState(true);

  useEffect(() => {
    setShowWatermark(!isSubscribed);
  }, [isSubscribed]);

  const scrollRef = useRef(null);

  const videoSource = `https://stream.mux.com/${playbackId}.m3u8`;
  const player = useVideoPlayer(videoSource, player => {
    player.loop = false;
    player.play();
  });

  useEffect(() => {
    if (selectedClip && player) {
      player.currentTime = selectedClip.start_time;
      player.play();
    }
  }, [selectedClip, player]);

  useEffect(() => {
    if (player) {
      player.playbackRate = isFastForward ? 2.0 : 1.0;
    }
  }, [isFastForward, player]);
  
  useEffect(() => {
    if (video_id) {
      initMiniClips(video_id);
      initAIVideo(video_id);
    }
  }, [video_id]);

  const initMiniClips = async (video_id) => {}

  const initAIVideo = async (video_id) => {}

  // Handle auto-play next live clip
  useEffect(() => {
    if (!player || !selectedClip) return;

    const interval = setInterval(async () => {
      if (
        player.playing &&
        player.currentTime >= selectedClip.end_time
      ) {
        const nextLive = rawMiniClips.find(
          (c) => 
            c.is_live && c.order > selectedClip.order
        );
        if (nextLive) {
          setSelectedClip(nextLive);
        } else {
          player.pause();
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [player, selectedClip, rawMiniClips]);

  useEffect(() => {
    if (!selectedClip || !scrollRef.current) return;
  
    const index = rawMiniClips.findIndex(c => c.order === selectedClip.order);
    if (index === -1) return;

    if(!initialized){
      setInitialized(true);
      return;
    }
  
    const offset = Math.max(index * thumbnailWidth - 20, 0); // left-align, clamp to 0
    scrollRef.current.scrollTo({
      x: offset,
      animated: true,
    });

    setShowAdd(!selectedClip.is_live);

  }, [selectedClip]);

  const toggleClipStatus = async () => {
    if (!selectedClip) return;
  
    const updatedStatus = !selectedClip.is_live;
    await updateClipLiveStatus(selectedClip.id, updatedStatus);
  
    const updatedClips = rawMiniClips.map((clip) => {
      if (clip.id === selectedClip.id) {
        return { ...clip, is_live: updatedStatus };
      }
      return clip;
    });
    setRawMiniClips(updatedClips);
  
    // Get index of current clip
    const currentIndex = rawMiniClips.findIndex(c => c.id === selectedClip.id);
    const nextClip = rawMiniClips[currentIndex + 1];
  
    if (nextClip && !updatedStatus) {
      setSelectedClip(nextClip);
    } else {
      // If there's no next clip, just update the current one
      setSelectedClip({ ...selectedClip, is_live: updatedStatus });
    }
  
    setShowAdd(!updatedStatus);
  };

  const updateClipLiveStatus = async (clipId, isLive) => {
    const res = await axios({ 
      method: 'post', 
      url: 'https://boiling-temple-07591-774b277da223.herokuapp.com/updateClipLiveStatus',
      data: { clipId, isLive }
    }); 
    if(!res.data.success){
      Alert.alert('Error updating clips :(', 'Our team is looking into it! Please text 949-346-2143 with any questions.');
      axios({ 
        method: 'post',
        url: 'https://boiling-temple-07591-774b277da223.herokuapp.com/notifyAIEditingError',
        data: { video_id }
      });   
    }
  }

  const handleExport = () => {
    setExported(true);
    player.pause();
    axios({ 
      method: 'post',
      url: 'https://boiling-temple-07591-774b277da223.herokuapp.com/export',
      data: { video_id, show_watermark: showWatermark }
    });   
  }

  const handlePurchase = async () => {
    try {
          if (!offerings) {
              Alert.alert("Error", "No offerings available. Please try again later.");
              return;
          }

          const packageToBuy = offerings.monthly;
          if (!packageToBuy) {
              Alert.alert("Error", "No purchase packages available.");
              return;
          }

          const { customerInfo } = await Purchases.purchasePackage(packageToBuy);
          const activeEntitlements = customerInfo.entitlements.active;

          if (activeEntitlements['pro']) {
              axios({ 
                  method: 'post', 
                  url: 'https://boiling-temple-07591-774b277da223.herokuapp.com/updateShowWatermark',
                  data: { videoId: video_id, showWatermark: false }
              }); 
              setShowWatermark(false);
          } else {
              Alert.alert("Purchase Error", "You don't have the required entitlement.");
          }
      } catch (e: any) {
          if (!e.userCancelled) {
              Alert.alert("Purchase Failed", e.message);
          }
      }
  };

  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const maxVideoHeight = screenHeight * 0.6;
  const aspectRatio =
    videoDimensions.width && videoDimensions.height
      ? videoDimensions.width / videoDimensions.height
      : 16 / 9;
  let displayWidth = screenWidth * 0.9;
  let displayHeight = displayWidth / aspectRatio;

  if (displayHeight > maxVideoHeight) {
    displayHeight = maxVideoHeight;
    displayWidth = displayHeight * aspectRatio;
  }

  const thumbnailMaxHeight = 45;
  const thumbnailWidth = thumbnailMaxHeight * aspectRatio + 10;

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: '', 
          headerBackTitle: 'Back', 
          headerShown: true,
          headerRight: () => (
            <>
              {!exported && <TouchableOpacity 
                onPress={handleExport}
              >
                <Text style={{ color: '#007AFF', fontWeight: '700', fontSize: 16 }}>
                  Export
                </Text>
              </TouchableOpacity>}
            </>
          ),
        }} 
      />
      {exported && (
      <View style={{ marginTop: 20, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
        <Text style={{ textAlign: 'center', marginTop: 10, fontWeight: '700', fontSize: 17, color: darkMode ? "#fff" : "#000" }}>Exporting Your Film!</Text>
        <Text style={{ textAlign: 'center', marginTop: 10, marginHorizontal: 30, color: darkMode ? "#fff" : "#000" }}>Feel free to close app. We'll email {email} as soon as it's ready.</Text>
        <TouchableOpacity
          onPress={() => {
            router.back();
          }}
          style={{
            backgroundColor: '#007AFF',
            paddingVertical: 12,
            paddingHorizontal: 24,
            borderRadius: 8,
            marginTop: 10
          }}
        >
          <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>
            Back to Home Page
          </Text>
        </TouchableOpacity>
      </View>
    )}
      {!exported && <View>
        <View
          style={{
            marginTop: 20,
            alignSelf: 'center',
            width: displayWidth,
            height: displayHeight,
          }}
        >
          <VideoView 
            style={{ 
              width: '100%', 
              height: '100%', 
              borderRadius: 12 
            }} 
            player={player} 
            nativeControls={false}
          />
          {showWatermark && <View style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
          }}>
            <Image
              source={WM[sport]}
              style={{
                  position: 'absolute',
                  bottom: 5,
                  right: 5,
                  width: 94,
                  height: 37.5,
                  opacity: 0.8
              }}
          />
          </View>}
        </View>
        <ScrollView
          horizontal
          style={{ marginTop: 50, paddingHorizontal: 10 }}
          contentContainerStyle={{ alignItems: 'center' }}
          ref={scrollRef}
        >
          {rawMiniClips.map((clip, index) => {
            const isSelected = selectedClip?.order === clip.order;
            const isDead = !clip.is_live;

            return (
              <TouchableOpacity
              key={index}
              onPress={() => setSelectedClip(clip)}
              style={{
                borderWidth: isSelected ? 2 : 0,
                borderColor: darkMode ? 'white' : 'blue',
                marginRight: 10,
                borderRadius: 6,
                opacity: isDead ? 0.2 : 1
              }}
            >
              <Image
                source={{ uri: `https://image.mux.com/${playbackId}/thumbnail.jpg?time=${(clip.start_time + clip.end_time)/2}&width=${width}&height=${height}` }}
                style={{ width: thumbnailMaxHeight * aspectRatio, height: thumbnailMaxHeight, borderRadius: 6 }}
              />
            </TouchableOpacity>
            )
          })}
        </ScrollView>
        <ScrollView style={{ paddingHorizontal: 10 }} horizontal={true}>
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20 }}>
            <TouchableOpacity
              onPress={toggleClipStatus}
              style={{
                justifyContent: 'center',
                backgroundColor: showAdd ? '#06BCEE' : '#FF4D4D',
                alignSelf: 'center',
                borderRadius: 8,
                width: 150,
                height: 35,
              }}
            >
              <Text style={{ color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: 14 }}>
                {showAdd ? 'Add Clip' : 'Remove Clip'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setIsFastForward(!isFastForward)}
              style={{
                alignSelf: "center",
                backgroundColor: isFastForward ? "white" : "black",
                borderRadius: 8,
                justifyContent: 'center',
                paddingHorizontal: 12,
                height: 35,
                borderWidth: 1,
                borderColor: "white",
                marginHorizontal: 20
              }}
            >
              <AntDesign name="forward" size={24} color={isFastForward ? "black" : "white"} />
            </TouchableOpacity>
            {showWatermark && <View style={{ borderWidth: 1, borderColor: 'white', borderRadius: 8 }}>
              <TouchableOpacity
                onPress={handlePurchase}
                style={{
                  justifyContent: 'center',
                  alignSelf: 'center',

                  width: 200,
                  height: 35,
                }}
              >
                <Text numberOfLines={2} style={{ color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: 14 }}>
                  Remove Watermark
                </Text>
              </TouchableOpacity>
            </View>}
          </View>
        </ScrollView>
      </View>}
    </>
  );
}