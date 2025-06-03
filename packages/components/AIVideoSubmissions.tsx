import { Colors } from '@constants/Colors';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Image, Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from 'expo-router';

const maxWidth = 120;

const statusKeys = {
    "submitted": { message: "Upload Incomplete", color: "red" },
    "submitted_number": { message: "Upload Incomplete", color: "red" },
    "submitted_email": { message: "Upload Incomplete", color: "red" },
    "video_uploaded": { message: "Video Processing", color: "#ffc107" },
    "ai_cut_merging": { message: "Video Processing", color: "#ffc107" },
    "ai_cut_created": { message: "Completed", color: "#28a745" },
    "ai_cut_sent": { message: "Completed", color: "#28a745" },
    "user_exporting": { message: "Video Processing", color: "#ffc107" },
    "export_uploading_to_mux": { message: "Video Processing", color: "#ffc107" },
    "export_merging": { message: "Video Processing", color: "#ffc107" }
  };


export default function AIVideoSubmissions({
    localUniqueUserId,
    darkMode
}){
    const router = useRouter();
    const [aiVideoSubmissions, setAIVideoSubmissions] = useState([]);

    useEffect(() => {
        getSubmissions();
    }, []);

    async function getSubmissions(){
        const res = await axios({ 
            method: 'post', 
            url: 'https://boiling-temple-07591-774b277da223.herokuapp.com/getAIVideoSubmissions',
            data: { localUniqueUserId }
        });
        setAIVideoSubmissions(res.data.submissions);
    }

    async function downloadVideo(master_url){
        Linking.openURL(master_url);
    }

    async function goToVideo(video_id, email){
        router.push(`/edit-video/${video_id}?email=${encodeURIComponent(email)}`);
    }

    return (
        <>
            {aiVideoSubmissions.map(video => {
                const within24Hours = (new Date().getTime() - new Date(video.created_at).getTime() < 23 * 60 * 60 * 1000);
                return (
                    <TouchableOpacity disabled={!(statusKeys && statusKeys[video.status] && statusKeys[video.status].message == "Completed")} onPress={() => goToVideo(video.video_id, video.email)} key={video.video_id} style={{ 
                        ...styles.videoCard, 
                        backgroundColor: darkMode ? Colors.dark.background : Colors.light.background,
                        shadowColor: darkMode ? Colors.dark.text : Colors.light.text,
                        borderColor: darkMode ? Colors.dark.text : Colors.light.background,
                        borderWidth: 0.5
                    }}>
                        <View style={{ marginLeft: 10 }}>
                            <Text style={{
                                ...styles.detailSubtitle,
                                color: darkMode ? '#FFF' : '#000',
                            }}>SUBMITTED</Text>
                            <Text style={{ 
                                ...styles.detailTitle,
                                color: darkMode ? '#FFF' : '#000',
                            }}>{new Date(video.created_at).toLocaleDateString()}</Text>
                            <Text style={{
                                ...styles.detailSubtitle,
                                color: darkMode ? '#FFF' : '#000',
                            }}>STATUS</Text>
                            {(() => {
                                const status = video.status;
                                const createdAt = new Date(video.created_at);
                                const now = new Date();
                                const minutesSinceCreated = (now.getTime() - createdAt.getTime()) / (1000 * 60);

                                const isUploadIncompleteStatus = ['submitted', 'submitted_number', 'submitted_email'].includes(status);

                                if (isUploadIncompleteStatus && minutesSinceCreated < 10) {
                                    return <Text style={{
                                        ...styles.detailTitle,
                                        color: "#ffc107", // treat as "Video Processing" for now
                                        fontWeight: '600'
                                    }}>Video Processing</Text>;
                                }

                                const message = statusKeys[status]?.message || "Video Processing";
                                const color = statusKeys[status]?.color || "#ffc107";

                                return <Text style={{
                                    ...styles.detailTitle,
                                    color,
                                    fontWeight: '600'
                                }}>{message}</Text>;
                            })()}
                        </View>
                        {video.playback_id && <View style={{ 
                            alignItems: 'center', 
                            marginVertical: 10 
                        }}>
                            <Image
                                width={maxWidth}
                                height={maxWidth * video.height / video.width}
                                style={styles.thumbnail}
                                source={{ uri: `https://image.mux.com/${video.playback_id}/thumbnail.jpg` }}
                            />
                            {video.master_url && within24Hours && 
                                <TouchableOpacity onPress={() => downloadVideo(video.master_url)} style={{ width: 110, marginTop: 5, backgroundColor: '#06BCEE', paddingVertical: 5, paddingHorizontal: 20, borderRadius: 15 }}>
                                    <Text style={{ color: Colors.dark.tint, fontWeight: '600', textAlign: 'center' }}>Download</Text>
                                </TouchableOpacity>
                                }
                            <TouchableOpacity onPress={() => goToVideo(video.video_id, video.email)} style={{ width: 110, marginTop: 5, backgroundColor: '#06BCEE', paddingVertical: 5, paddingHorizontal: 20, borderRadius: 15 }}>
                                <Text style={{ color: Colors.dark.tint, fontWeight: '600', textAlign: 'center' }}>Edit</Text>
                            </TouchableOpacity>
                        </View>}
                    </TouchableOpacity>
                )
            })}
        </>
    )
}

const styles = StyleSheet.create({
    videoCard: {
        marginTop: 30,
      borderRadius: 8,
      paddingHorizontal: 15,
      marginHorizontal: 10,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.22,
      shadowRadius: 2.22,
      elevation: 3,
      flexDirection: 'row',
      justifyContent: 'space-between', 
      alignItems: 'center'
    },
    thumbnail: {
      marginHorizontal: 10,
      borderRadius: 15,
    },
    detailTitle: {
      fontSize: 16,
      fontWeight: '500',
      marginBottom: 12
    },
    detailSubtitle: {
        marginTop: 12,
      fontSize: 12,
      fontWeight: '400'
    },  });
  