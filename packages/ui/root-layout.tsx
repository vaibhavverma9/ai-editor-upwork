import React from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import Purchases from "react-native-purchases";
import { useColorScheme } from '@hooks/useColorScheme';
import { PostHogProvider } from 'posthog-react-native';
import { Platform } from 'react-native';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('.../../packages/assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    Purchases.configure({
      apiKey: Platform.OS === "ios"
        ? "appl_zKwdXzPTOVjEPlUexOKtQrCDKlC"
        : "your_android_key",
      appUserID: null, 
    });
  }, []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <PostHogProvider apiKey="phc_S59G1bQPIsjdwg4pvpQOxZW2BkRHU5Mr0DHO8eX3jhN" options={{ host: 'https://us.i.posthog.com' }}>
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
    </PostHogProvider>
  );
}
