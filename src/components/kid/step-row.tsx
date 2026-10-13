import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, Keyframe } from 'react-native-reanimated';

import { AppText } from '@/components/app-text';
import { Emoji } from '@/components/emoji';
import { stepSubtitle } from '@/domain/format';
import type { StepRow as StepRowData } from '@/domain/timer';
import type { Step } from '@/domain/types';
import { doneTint } from '@/theme/color';
import { colors, sticker } from '@/theme/tokens';

import { StickerPressable } from './sticker-pressable';

/** ✓ pops in: scale 0→1 and rotate -90°→0 with overshoot. */
const checkPop = new Keyframe({
  0: { transform: [{ scale: 0 }, { rotate: '-90deg' }] },
  100: {
    transform: [{ scale: 1 }, { rotate: '0deg' }],
    easing: Easing.bezier(0.3, 1.8, 0.5, 1),
  },
}).duration(400);

type Props = { step: Step; row: StepRowData; color: string; onPress: () => void };

export function StepRow({ step, row, color, onPress }: Props) {
  const done = row.status === 'done';
  const exact = step.mode === 'exact';

  return (
    <StickerPressable
      onPress={onPress}
      shadow={sticker.shadow.row}
      radius={sticker.radius.row}
      sunk={done}
      accessibilityLabel={`${step.label}${done ? ', done' : ''}`}
      faceStyle={[styles.face, { backgroundColor: done ? doneTint(color) : colors.white }]}>
      <View style={styles.icon}>
        <Emoji size={34}>{step.emoji}</Emoji>
      </View>
      <View style={[styles.text, { opacity: done ? 0.6 : 1 }]}>
        <AppText
          size={22}
          weight="semibold"
          style={[styles.label, done && styles.strike]}>
          {step.label}
        </AppText>
        <AppText size={14} color={colors.muted} tabular>
          {stepSubtitle(step, done)}
        </AppText>
      </View>
      <View style={[styles.mark, { backgroundColor: done ? colors.ink : colors.white }]}>
        {row.resettable ? (
          <Animated.View entering={checkPop}>
            <MaterialIcons name="refresh" size={28} color={colors.white} />
          </Animated.View>
        ) : done ? (
          <Animated.View entering={checkPop}>
            <MaterialIcons name="check" size={28} color={colors.white} />
          </Animated.View>
        ) : exact ? (
          <MaterialIcons name="play-arrow" size={28} color={colors.ink} />
        ) : null}
      </View>
    </StickerPressable>
  );
}

const styles = StyleSheet.create({
  face: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  icon: {
    width: 60,
    height: 60,
    borderRadius: 18,
    borderWidth: 2.5,
    borderColor: colors.ink,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1, minWidth: 0, gap: 2 },
  label: { lineHeight: 25 },
  strike: { textDecorationLine: 'line-through' },
  mark: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: sticker.border,
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
