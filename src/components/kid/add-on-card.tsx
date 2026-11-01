import { StyleSheet, View } from 'react-native';
import Animated, { Easing, Keyframe, useReducedMotion } from 'react-native-reanimated';

import { AppText } from '@/components/app-text';
import { Emoji } from '@/components/emoji';
import { formatClock } from '@/domain/format';
import type { AddOnState } from '@/domain/timer';
import { colors, sticker } from '@/theme/tokens';

import { ProgressRing } from './progress-ring';

const enter = new Keyframe({
  0: { opacity: 0, transform: [{ translateY: 16 }] },
  100: { opacity: 1, transform: [{ translateY: 0 }], easing: Easing.bezier(0.3, 1.4, 0.5, 1) },
}).duration(350);

type Props = { addOn: AddOnState; totalLeft: number; color: string };

/** A running add-on, alone on screen like focus mode: its countdown plus the routine's "All steps". */
export function AddOnCard({ addOn, totalLeft, color }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <Animated.View entering={reduceMotion ? undefined : enter} style={styles.card}>
      <View style={styles.pill}>
        <AppText size={16} weight="semibold" color={colors.muted}>
          Something came up
        </AppText>
      </View>
      <ProgressRing
        size={230}
        border={4}
        inner={170}
        innerBorder={3}
        fraction={addOn.fraction}
        color={addOn.overtime ? colors.overtimeRing : color}>
        <Emoji size={80}>{addOn.overtime ? '😬' : addOn.emoji}</Emoji>
      </ProgressRing>
      <View style={styles.texts}>
        <AppText size={32} weight="bold" align="center" style={{ lineHeight: 35 }}>
          {addOn.label}
        </AppText>
        <AppText
          size={addOn.overtime ? 44 : 64}
          weight="bold"
          tabular
          color={addOn.overtime ? colors.overtimeText : colors.ink}
          style={{ lineHeight: 68 }}>
          {addOn.overtime ? "Time's up!" : formatClock(addOn.left)}
        </AppText>
      </View>
      <View style={styles.total}>
        <AppText size={15} color={colors.muted}>
          ⏱️ All steps
        </AppText>
        <AppText
          size={20}
          weight="semibold"
          tabular
          color={totalLeft >= 0 ? colors.ink : colors.overtimeText}>
          {totalLeft >= 0 ? formatClock(totalLeft) : `+${formatClock(totalLeft)}`}
        </AppText>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    backgroundColor: colors.white,
    borderWidth: sticker.border,
    borderColor: colors.ink,
    borderRadius: 32,
    boxShadow: `0 ${sticker.shadow.card}px 0 ${colors.ink}`,
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  pill: {
    backgroundColor: colors.parentGround,
    borderRadius: 99,
    paddingVertical: 4,
    paddingHorizontal: 14,
  },
  texts: { alignItems: 'center', gap: 6 },
  total: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
});
