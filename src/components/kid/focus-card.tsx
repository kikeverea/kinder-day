import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { Easing, Keyframe, useReducedMotion } from 'react-native-reanimated';

import { AppText } from '@/components/app-text';
import { Emoji } from '@/components/emoji';
import { formatClock } from '@/domain/format';
import type { FocusState } from '@/domain/timer';
import { colors, sticker } from '@/theme/tokens';

import { ProgressRing } from './progress-ring';

const enter = new Keyframe({
  0: { opacity: 0, transform: [{ translateY: 16 }] },
  100: { opacity: 1, transform: [{ translateY: 0 }], easing: Easing.bezier(0.3, 1.4, 0.5, 1) },
}).duration(350);

type Props = {
  focus: FocusState;
  color: string;
  onPause: () => void;
  onResume: () => void;
};

/** Focus mode: the running (or paused) exact step, alone on screen. */
export function FocusCard({ focus, color, onPause, onResume }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <Animated.View entering={reduceMotion ? undefined : enter} style={styles.card}>
      <View style={styles.pill}>
        <AppText size={16} weight="semibold" color={colors.muted}>
          Step {focus.stepNumber} of {focus.totalSteps}
        </AppText>
      </View>
      <ProgressRing
        size={250}
        border={4}
        inner={184}
        innerBorder={3}
        fraction={focus.fraction}
        color={color}>
        <Emoji size={84}>{focus.step.emoji}</Emoji>
      </ProgressRing>
      <View style={styles.texts}>
        <AppText size={32} weight="bold" align="center" style={{ lineHeight: 35 }}>
          {focus.step.label}
        </AppText>
        <AppText size={64} weight="bold" tabular style={{ lineHeight: 68 }}>
          {formatClock(focus.left)}
        </AppText>
        <AppText size={19} color={colors.secondary} align="center">
          {focus.paused ? 'Paused' : focus.cheer}
        </AppText>
      </View>
      <Pressable
        onPress={focus.paused ? onResume : onPause}
        accessibilityRole="button"
        style={({ pressed }) => [styles.pause, pressed && { backgroundColor: colors.pressedTint }]}>
        <AppText size={16} color={colors.muted}>
          {focus.paused ? '▶ Resume' : '⏸ Pause'}
        </AppText>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 22,
    backgroundColor: colors.white,
    borderWidth: sticker.border,
    borderColor: colors.ink,
    borderRadius: 32,
    boxShadow: `0 ${sticker.shadow.card}px 0 ${colors.ink}`,
    paddingVertical: 28,
    paddingHorizontal: 20,
  },
  pill: {
    backgroundColor: colors.parentGround,
    borderRadius: 99,
    paddingVertical: 4,
    paddingHorizontal: 14,
  },
  texts: { alignItems: 'center', gap: 6 },
  pause: {
    height: 44,
    paddingHorizontal: 18,
    borderRadius: 99,
    borderWidth: 2,
    borderColor: colors.parentBorder,
    backgroundColor: colors.white,
    justifyContent: 'center',
  },
});
