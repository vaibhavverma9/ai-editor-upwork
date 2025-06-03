import * as SMS from 'expo-sms';
import { ScrollView, Text, TouchableOpacity } from 'react-native';
import { styles } from '@styles';
import React from 'react';

export default function Support(){

    const contactUs = () => {
        SMS.sendSMSAsync(
          ['+19493462143'],
          ''
        );
    };
      
    return (
        <ScrollView
            style={{
                marginTop: 80,
                marginBottom: 100
            }}
        >
            <TouchableOpacity
                style={{ ...styles.button, marginVertical: 15, width: '70%' }}
                onPress={contactUs}
            >
                <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 16, textAlign: 'center' }}>
                    Support
                </Text>
            </TouchableOpacity>
        </ScrollView>
    )
}