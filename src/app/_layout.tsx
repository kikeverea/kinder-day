import {
  Fredoka_400Regular,
  Fredoka_500Medium,
  Fredoka_600SemiBold,
  Fredoka_700Bold,
  useFonts,
} from '@expo-google-fonts/fredoka';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useStoreClock } from '@/hooks/use-store-clock';
import { useAppStore } from '@/store';
import { colors } from '@/theme/tokens';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Fredoka_400Regular,
    Fredoka_500Medium,
    Fredoka_600SemiBold,
    Fredoka_700Bold,
  });
  const parentUnlocked = useAppStore((s) => s.parentUnlocked);
  useStoreClock();

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync();
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: { backgroundColor: colors.kidGround },
        }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="routine/[id]" />
        <Stack.Screen name="result/[id]" options={{ gestureEnabled: false }} />
        {/* Grown-ups area: unreachable (and dropped from history) unless unlocked from Kid Home. */}
        <Stack.Protected guard={parentUnlocked}>
          <Stack.Screen name="parent/index" options={{ contentStyle: { backgroundColor: colors.parentGround } }} />
        </Stack.Protected>
      </Stack>
    </GestureHandlerRootView>
  );
}
