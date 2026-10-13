import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { AppText } from '@/components/app-text';
import { Emoji } from '@/components/emoji';
import { colors, sticker } from '@/theme/tokens';

const SIZE = 52;
const SHADOW = sticker.shadow.small;
const HOLD_MS = 1200;
const HINT_MS = 1800;

/** 🔒 Grown-ups entry: press and hold 1.2s (it fills up); a tap only shows a hint. */
export function LockButton({ onUnlock }: { onUnlock: () => void }) {
  const fill = useSharedValue(0);
  const [hint, setHint] = useState(false);
  const holdTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const hintTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(
    () => () => {
      clearTimeout(holdTimer.current);
      clearTimeout(hintTimer.current);
    },
    [],
  );

  const pressIn = () => {
    clearTimeout(hintTimer.current);
    setHint(true);
    fill.value = withTiming(1, { duration: HOLD_MS, easing: Easing.linear });
    holdTimer.current = setTimeout(() => {
      holdTimer.current = undefined;
      fill.value = 0;
      setHint(false);
      onUnlock();
    }, HOLD_MS);
  };

  const pressOut = () => {
    if (!holdTimer.current) return; // already unlocked
    clearTimeout(holdTimer.current);
    holdTimer.current = undefined;
    fill.value = withTiming(0, { duration: 250, easing: Easing.out(Easing.quad) });
    hintTimer.current = setTimeout(() => setHint(false), HINT_MS);
  };

  const fillStyle = useAnimatedStyle(() => ({ height: `${fill.value * 100}%` }));

  return (
    <View style={styles.wrap}>
      <Pressable
        onPressIn={pressIn}
        onPressOut={pressOut}
        accessibilityRole="button"
        accessibilityLabel="Grown-ups: press and hold"
        style={styles.button}>
        <View style={styles.shadow} />
        <View style={styles.face}>
          <Animated.View style={[styles.fill, fillStyle]} />
          <Emoji size={22}>🔒</Emoji>
        </View>
      </Pressable>
      <AppText size={11} color={colors.muted} style={{ opacity: hint ? 1 : 0 }}>
        hold, grown-ups
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 4 },
  button: { width: SIZE, height: SIZE + SHADOW },
  shadow: {
    position: 'absolute',
    top: SHADOW,
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: colors.ink,
  },
  face: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: sticker.border,
    borderColor: colors.ink,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fill: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: colors.lock },
});
