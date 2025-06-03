import { Alert, Image, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useOfferings } from '@hooks/useOfferings';
import Purchases from 'react-native-purchases';
import axios from 'axios';

const WM = {
    pickleball: require('@assets/images/watermark-pickleball.png'),
    tennis:     require('@assets/images/watermark-tennis.png'),
  } as const;  

export default function WatermarkPage({
    thumbnailUri,
    setShowWatermark,
    darkMode,
    videoId,
    sport
}){
    const offerings = useOfferings(sport);

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
                    data: { videoId, showWatermark: false }
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

    return (
        <View style={{ marginTop: 80, alignItems: 'center', paddingHorizontal: 20 }}>
            <View style={{ position: 'relative', width: '100%', aspectRatio: 16 / 9 }}>
                <Image
                    source={{ uri: thumbnailUri }}
                    style={{ width: '100%', height: '100%', borderRadius: 10 }}
                    resizeMode="cover"
                />
                <Image
                    source={WM[sport]}
                    style={{
                        position: 'absolute',
                        bottom: 10,
                        right: 10,
                        width: 94,
                        height: 37.5,
                        opacity: 0.7
                    }}
                />
            </View>

            <TouchableOpacity
                onPress={handlePurchase}
                style={{
                    marginTop: 30,
                    paddingVertical: 12,
                    paddingHorizontal: 30,
                    borderRadius: 30,
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#fff',
                    borderWidth: darkMode ? 0 : 2,
                    borderColor: '#000'
                }}
            >
                <Text style={{ color: '#000', fontSize: 16, fontWeight: '700', marginRight: 5 }}>Remove Watermark</Text>
                <Ionicons name="diamond-sharp" size={16} color="#4B0082" />
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => setShowWatermark(false)}
                style={{ marginTop: 15 }}
            >
                <Text style={{ color: darkMode ? '#fff' : '#000', fontSize: 14, fontWeight: '600' }}>
                    Skip
                </Text>
            </TouchableOpacity>
        </View>
    )
}