import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Emoji } from '@/components/emoji';
import { colors, sticker } from '@/theme/tokens';

const HEIGHT = 28;
const STAR = 30;
const overshoot = { duration: 550, easing: Easing.bezier(0.3, 1.4, 0.5, 1) };

/** Checklist progress: fill in the routine colour with a ⭐ riding its leading edge. */
export function ProgressBar({ fraction, color }: { fraction: number; color: string }) {
  const value = useSharedValue(fraction);

  useEffect(() => {
    value.value = withTiming(fraction, overshoot);
  }, [fraction, value]);

  const fill = useAnimatedStyle(() => ({ width: `${value.value * 100}%` }));
  const star = useAnimatedStyle(() => ({ left: `${value.value * 100}%` }));

  return (
    <View style={styles.track}>
      <Animated.View style={[styles.fill, { backgroundColor: color }, fill]} />
      <Animated.View style={[styles.star, star]} pointerEvents="none">
        <Emoji size={STAR}>⭐</Emoji>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: HEIGHT,
    borderWidth: sticker.border,
    borderColor: colors.ink,
    borderRadius: HEIGHT,
    backgroundColor: colors.white,
  },
  fill: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: HEIGHT },
  star: {
    position: 'absolute',
    top: (HEIGHT - sticker.border * 2 - STAR * 1.2) / 2,
    marginLeft: -STAR / 2,
    width: STAR,
  },
});
