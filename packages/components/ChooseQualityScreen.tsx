
import { Text, TouchableOpacity, View } from 'react-native';
import React from 'react';

export default function ChooseQualityScreen({
    setQualitySelectionScreen,
    selectedVideo,
    uploadVideoToServer,
    setUploadedVideo,
    darkMode,
    setAskForNumber
}){
    const PRESETS = {
        fast: { label: '720px · 2 Mbps', bitrate: 2_000_000, maxSize: 720 },
        balanced: { label: '1080px · 5 Mbps', bitrate: 5_000_000, maxSize: 1080 },
        original: { label: 'Highest Quality', bitrate: null, maxSize: null },
      };
    
    
    const handleChoose = (bitrate, maxSize) => {
        setQualitySelectionScreen(false);
        uploadVideoToServer(selectedVideo, bitrate, maxSize); // you'll need to modify uploadVideoToServer to accept preset
        setUploadedVideo(true);
        setAskForNumber(true);
    };
    
    return (
        <View style={{ marginTop: 100, height: '100%', paddingHorizontal: 30 }}>
        <Text style={{ textAlign: 'center', fontWeight: '600', fontSize: 16, marginBottom: 20, color: darkMode ? "#fff" : "#000" }}>
            Choose quality of your video
        </Text>
    
        {Object.entries(PRESETS).map(([key, { label, bitrate, maxSize }]) => (
            <TouchableOpacity
            key={key}
            onPress={() => handleChoose(bitrate, maxSize)}
            style={{
                backgroundColor: '#eee',
                padding: 20,
                borderRadius: 12,
                marginBottom: 15
            }}
            >
            <Text style={{ fontWeight: '700', fontSize: 15, marginBottom: 4 }}>
                {key === 'fast' ? 'Fast' : key === 'balanced' ? 'Balanced' : 'Original'}
            </Text>
            <Text>{label}</Text>
            </TouchableOpacity>
        ))}
        </View>
    );
}