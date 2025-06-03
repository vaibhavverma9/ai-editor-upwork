import { MMKVLoader } from "react-native-mmkv-storage";
import * as FileSystem from 'expo-file-system';

export const logWithTimestamp = (message, ...optionalParams) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`, ...optionalParams);
};

export const generateRandomId = () => {
    const timestamp = Date.now(); // Current timestamp in milliseconds
    const randomInt = Math.floor(Math.random() * 1000000); // Random integer between 0 and 999999
    return `${timestamp}-${randomInt}`;
}

export const storage = new MMKVLoader().initialize();

export function generateLocalId(length = 10): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

export async function getSafeVideoUri(asset, videoId) {
  console.log("getSafeVideoUri");
    const filename = `${videoId}.mp4`;
    const destUri = `${FileSystem.documentDirectory}${filename}`;
    
    // Only copy if not already there
    const info = await FileSystem.getInfoAsync(destUri);
    if (!info.exists) {
      await FileSystem.copyAsync({ from: asset.uri, to: destUri });
    }
  
    return destUri;
  }