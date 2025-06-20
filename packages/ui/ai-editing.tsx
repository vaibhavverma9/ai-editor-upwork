import { generateLocalId, generateRandomId, logWithTimestamp, storage, getSafeVideoUri } from '@functions';
import { useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { styles } from '@styles';
import { Video } from 'react-native-compressor';
import { usePostHog } from 'posthog-react-native';
import { ReactNativeFile } from 'tus-js-client';
import { useColorScheme } from '@hooks/useColorScheme';
import React from 'react';
import ChooseQualityScreen from '@components/ChooseQualityScreen';
import { useMMKVStorage } from 'react-native-mmkv-storage';
import AIVideoSubmissions from '@components/AIVideoSubmissions';
import { useSubscriptionStatus } from '@hooks/useSubscriptionStatus';
import * as VideoThumbnails from 'expo-video-thumbnails';
import WatermarkPage from '@components/WatermarkPage';

import { Upload, setupClient } from 'react-native-tus-client';

export default function AIEditing({
    sport
}){

    const isSubscribed = useSubscriptionStatus(sport);
    const colorScheme = useColorScheme();
    const darkMode = colorScheme == "dark";
    const posthog = usePostHog();
    const [localUniqueUserId, setLocalUniqueUserId] = useMMKVStorage("localUniqueUserId", storage, "");
    const [email, setEmail] = useMMKVStorage("email", storage, "");

    // Video details
    const [videoLoading, setVideoLoading] = useState(false);
    const [uploadedVideo, setUploadedVideo] = useState(false);
    const [videoId, setVideoId] = useState("");
    const [loadingPercentage, setLoadingPercentage] = useState(0);
    const [selectedVideo, setSelectedVideo] = useState(null);

    const [askForNumber, setAskForNumber] = useState(false);
    const [qualitySelectionScreen, setQualitySelectionScreen] = useState(false);
    const [thumbnailUri, setThumbnailUri] = useState('');

    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('idle'); // 'idle' | 'uploading' | 'success' | 'error'
    const [error, setError] = useState<string | null>(null);
    const [uploadId, setUploadId] = useState<string | null>(null);

    const uploadOneMore = () => {
        getVideoId();
        uploadVideo();
    }

    const uploadVideo = async () => {
        //Alert.alert("uploadvideo");
        //return;
        posthog.capture("user_opened_video_picker");
        logWithTimestamp("Upload video initiated");
        setTimeout(() => {
            setVideoLoading(true);
        }, 100);

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["videos"],
            allowsMultipleSelection: false,
            preferredAssetRepresentationMode: ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Current,
            videoQuality: ImagePicker.UIImagePickerControllerQualityType.VGA640x480
        });
        console.log("result", result);

        setLoadingPercentage(0.01);

        posthog.capture("user_selected_video");
        
        if (!result.canceled) {
            setSelectedVideo(result.assets[0]);
            setQualitySelectionScreen(true);
            logWithTimestamp("Video selected", result.assets[0]);
            const { uri } = await VideoThumbnails.getThumbnailAsync(
                result.assets[0].uri,
                {
                    time: 0,
                }
            );
            setThumbnailUri(uri);
        } else {
            logWithTimestamp("Video selection canceled");
            setLoadingPercentage(0);
        }
        
        setVideoLoading(false);
    };

    const getVideoId = async () => {
        const videoId = generateRandomId();
        setVideoId(videoId);
    }

    useEffect(() => {
        getVideoId();

        const initializeClient = async () => {
            try {
                await setupClient('https://boiling-temple-07591-774b277da223.herokuapp.com/uploads', 5 * 1024 * 1024);
                console.log('TUS client initialized successfully');
            } catch (err) {
                console.error('Failed to initialize TUS client:', err);
                setError('Failed to initialize upload client');
                setStatus('error');
            }
        };

        initializeClient();
    }, []);

    useEffect(() => {

        if(localUniqueUserId == ""){
            console.log("initializing local unique id");
            const uniqueId = generateLocalId();
            setLocalUniqueUserId(uniqueId);
        }
    }, [localUniqueUserId]);

    const tryUploadVideo = async (file) => {
        console.log("tryUploadVideo", file);
        const upload = new Upload(file.uri, {
            endpoint: 'https://boiling-temple-07591-774b277da223.herokuapp.com/uploads',
            metadata: {
                filename: file.name,
                filetype: file.type,
                uploadId: videoId
            },
            onProgress: (progress) => {
                console.log(`Upload progress: ${0.20 + (progress * 100) * 0.80}%`);
                setLoadingPercentage(progress);
                logWithTimestamp('TUS Upload Progress:', progress);
            },
            onSuccess: (url) => {
                console.log('Upload completed:', url);
                logWithTimestamp('Upload successful');
                posthog.capture('video_upload_success');
                axios({ 
                    method: 'post', 
                    // url: 'http://172.20.10.3:4000/markRawAIVideoReady',
                    url: 'https://boiling-temple-07591-774b277da223.herokuapp.com/markRawAIVideoReady',
                    data: { videoId }
                });
                setLoadingPercentage(1);
            },
            onError: (error) => {
                //console.error('Upload failed:', error);
                setAskForNumber(false);
                setVideoLoading(false);
                setSelectedVideo(null);
                setLoadingPercentage(0);
                setUploadedVideo(false);
                logWithTimestamp('Upload failed', error);
                posthog.capture('video_upload_failed', { error: error.message });
                Alert.alert(`Upload error`, `Please text 949-346-2143 for customer support.`);
            }
        });

        await upload.start();
        console.log('Upload started:', result);

    }

    /* const tryUploadVideo = async (file) => {
        consoe.log("tryUploadVideo", file);
        const upload = new Upload(file, {
          // endpoint: 'http://172.20.10.3:4000/uploads',
          endpoint: 'https://boiling-temple-07591-774b277da223.herokuapp.com/uploads',
          metadata: {
            filename: file.name,
            filetype: file.type,
            uploadId: videoId
          },
          removeFingerprintOnSuccess: true,
          chunkSize: 5 * 1024 * 1024,
          retryDelays: [0, 1000, 3000, 5000],
          onProgress(bytesUploaded, bytesTotal) {
            console.log(bytesUploaded, bytesTotal);
            const progress = bytesUploaded / bytesTotal;
            setLoadingPercentage(0.20 + progress * 0.80);
            logWithTimestamp('TUS Upload Progress:', { bytesUploaded, bytesTotal });
          },
          onSuccess() {
            logWithTimestamp('Upload successful');
            posthog.capture('video_upload_success');
            axios({ 
                method: 'post', 
                // url: 'http://172.20.10.3:4000/markRawAIVideoReady',
                url: 'https://boiling-temple-07591-774b277da223.herokuapp.com/markRawAIVideoReady',
                data: { videoId }
            });
            setLoadingPercentage(1);
          },
          onError(error) {
            setAskForNumber(false);
            setVideoLoading(false);
            setSelectedVideo(null);
            setLoadingPercentage(0);
            setUploadedVideo(false);
            logWithTimestamp('Upload failed', error);
            posthog.capture('video_upload_failed', { error: error.message });
            Alert.alert(`Upload error`, `Please text 949-346-2143 for customer support.`);
          }
        });
        upload.start();
    }; */

    const uploadVideoToServer = async (asset, bitrate, maxSize) => {
        console.log("uploadVideoToServer");
        const uri = asset.uri; 
        const passthroughId = generateRandomId();
        let finalUri = ""
        let file = {};

        if(bitrate && maxSize){
            finalUri = await Video.compress(
                uri,
                {
                 compressionMethod: 'manual',
                 bitrate: bitrate,
                 maxSize: maxSize,
                  minimumFileSizeForCompress: 16,
                  progressDivider: 5,
                  downloadProgress: (progress) => {
                    logWithTimestamp('downloadProgress: ', progress);
                  },
                },
                (progress) => {
                    setLoadingPercentage(0.01 + progress * 0.19);
                    logWithTimestamp('Compression Progress: ', progress);
                }
            );
            file = {
                uri: finalUri,
                name: `${videoId}.mp4`,
                type: 'video/mp4'
            };
        } else {
            // console.log("fetching blob");
            setLoadingPercentage(0.05);
            // const blob = await fetch(uri).then(res => res.blob());
            // file = {
            //     name: `${videoId}.mp4`,
            //     type: 'video/mp4',
            //     size: blob.size,
            //     slice: blob.slice.bind(blob), // needed by tus
            // };
            const safeUri = await getSafeVideoUri(asset, videoId);
            console.log("creating react native file: "+safeUri+", videoId::"+videoId+", size::"+asset.fileSize);
            file = {
                uri: safeUri,
                name: `${videoId}.mp4`,
                type: 'video/mp4'
            };
            console.log("successfully createdf react native file");
        }

        console.log("calling /insertRawAIVideo");

        axios({ 
            method: 'post', 
            url: 'https://boiling-temple-07591-774b277da223.herokuapp.com/insertRawAIVideo',
            data: { videoId, showWatermark: false, height: asset.height, width: asset.width, deviceAssetId: asset.assetId, passthroughId, duration: asset.duration }
        }); 

        setLoadingPercentage(0.20); 
        console.log("before calling tryUploadVideo::", file);
        await tryUploadVideo(file);
    }

    const submitEmail = async () => {
        posthog.capture("user_submitted_email", { email });
        axios({ 
            method: 'post', 
            url: 'https://boiling-temple-07591-774b277da223.herokuapp.com/insertAIVideoSubmission',
            data: { videoId, email, localUniqueUserId, showWatermark: !isSubscribed, sport }
        }); 
        setAskForNumber(false);
    }

    const goToHome = () => {
        setLoadingPercentage(0);
        setUploadedVideo(false);
    }

    if(qualitySelectionScreen && selectedVideo){
        return (
            <ChooseQualityScreen 
                setQualitySelectionScreen={setQualitySelectionScreen}
                selectedVideo={selectedVideo}
                uploadVideoToServer={uploadVideoToServer}
                setUploadedVideo={setUploadedVideo}
                darkMode={darkMode}
                setAskForNumber={setAskForNumber}
            />
        )
    }

    if(askForNumber){
        return (
            <View style={{ marginTop: 100, height: '100%' }}>
                <Text style={{ textAlign: 'center', fontWeight: '600', fontSize: 16, color: darkMode ? "#fff" : "#000" }}>What is your email address?</Text>
                <Text style={{ textAlign: 'center', marginTop: 2, marginHorizontal: 20, color: darkMode ? "#fff" : "#000" }}>We will send the AI-edited video to your email when it's ready</Text>
                <TextInput
                    value={email}
                    autoFocus={true}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    placeholder="you@example.com"
                    placeholderTextColor={'#888'}
                    autoCapitalize='none'
                    style={{ color: darkMode ? "#fff" : "#000", alignSelf: 'center', borderWidth: 1, width: '75%', textAlign: 'center', marginTop: 20, borderColor: '#BBB', paddingVertical: 15, paddingHorizontal: 30, borderRadius: 25 }}
                />
                <TouchableOpacity
                    style={styles.button}
                    onPress={submitEmail}
                >
                    <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 16, textAlign: 'center' }}>
                        Submit
                    </Text>
                </TouchableOpacity>
            </View>
        )
    }

    if(videoLoading || (loadingPercentage != 0 && loadingPercentage != 1)){
        return (
            <View style={{ marginTop: 100, height: '100%' }}>
                <ActivityIndicator size="small" color={darkMode ? "#fff" : "#000"} />
                {loadingPercentage != 0 && <Text style={{ textAlign: 'center', marginTop: 10, color:  darkMode ? "#fff" : "#000" }}>{Math.round(100 * loadingPercentage)}%</Text>}
                {loadingPercentage != 0 && <Text style={{ textAlign: 'center', marginTop: 25, fontWeight: '700', fontSize: 15, color: darkMode ? "#fff" : "#000" }}>Keep the app open and active on your screen</Text>}
                {loadingPercentage != 0 && <Text style={{ marginTop: 2, textAlign: 'center', marginHorizontal: 20, color:  darkMode ? "#fff" : "#000" }}>Leaving the app or putting it in the background may interrupt the upload!</Text>}
            </View>
        )
    }

    if(loadingPercentage == 1){
        return (
            <ScrollView style={{ marginTop: 100, height: '100%' }}>
                <Text style={{ textAlign: 'center', marginTop: 10, fontWeight: '700', fontSize: 17, color: darkMode ? "#fff" : "#000" }}>✂️ AI is Editing Your Film!</Text>
                <Text style={{ textAlign: 'center', marginTop: 2, marginHorizontal: 30, color: darkMode ? "#fff" : "#000" }}>Feel free to close app. We'll email {email} as soon as it's ready.</Text>
                <TouchableOpacity
                    style={styles.button}
                    onPress={uploadOneMore}
                >
                    <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 16, textAlign: 'center' }}>
                        Upload One More
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{ 
                        marginTop: 15, 
                        marginBottom: 15,
                        paddingVertical: 10, 
                        paddingHorizontal: 15, 
                        borderRadius: 25,
                        shadowColor: '#000', // iOS
                        shadowOffset: { width: 0, height: 2 }, // iOS
                        shadowOpacity: 0.3, // iOS
                        shadowRadius: 4, // iOS
                        elevation: 5, // Android
                        width: '75%',
                        alignSelf: 'center',
                        borderWidth: 1,
                        borderColor: darkMode ? '#FFF' : '#000'
                     }}
                    onPress={goToHome}
                >
                    <Text style={{ color: darkMode ? '#FFF' : '#000', fontWeight: '600', fontSize: 16, textAlign: 'center' }}>
                        Go to Home
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        )
    }

    if(!uploadedVideo){
        return (
            <ScrollView style={{ ...styles.header, height: '100%' }}>
                <Text style={{ textAlign: 'center', fontWeight: '700', fontSize: 16, paddingHorizontal: 30, color: darkMode ? "#fff" : "#000" }}>Let AI remove dead time in your film</Text>
                <TouchableOpacity
                    style={styles.button}
                    onPress={uploadVideo}
                >
                    <Text style={{ color: "#fff", fontWeight: '700', fontSize: 16, textAlign: 'center' }}>
                        Upload
                    </Text>
                </TouchableOpacity>
                <AIVideoSubmissions darkMode={darkMode} localUniqueUserId={localUniqueUserId} />
            </ScrollView>
        )
    } else {
        return null;
    }
    
}

