import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { MAX_STEP_MINS, MIN_STEP_MINS } from '@/domain/constants';
import { colors } from '@/theme/tokens';

type Props = {
  mins: number;
  onChange: (mins: number) => void;
  large?: boolean;
  /** Defaults to a step's range, 1–60. */
  min?: number;
  max?: number;
  /** Shown before the stepper in a fixed-width column, so labelled steppers stacked together line up. */
  label?: string;
};

/** − ⏱️ 3 min + (1–60 unless `min`/`max` say otherwise) */
export function MinutesStepper({
  mins,
  onChange,
  large,
  min = MIN_STEP_MINS,
  max = MAX_STEP_MINS,
  label,
}: Props) {
  const size = large ? 36 : 28;
  const button = [
    styles.button,
    { width: size, height: size, borderRadius: size / 2 },
    large && styles.largeButton,
  ];
  const color = large ? colors.ink : colors.accentMuted;
  return (
    <View style={styles.row}>
      {label ? (
        <AppText size={large ? 15 : 13} weight="semibold" color={color} style={{ width: large ? 60 : 52 }}>
          {label}
        </AppText>
      ) : null}
      <Pressable
        onPress={() => onChange(mins - 1)}
        disabled={mins <= min}
        accessibilityLabel={label ? `Less time ${label.toLowerCase()}` : 'Less time'}
        style={[button, mins <= min && styles.disabled]}>
        <AppText size={large ? 20 : 16} weight="semibold" color={color}>
          −
        </AppText>
      </Pressable>
      <AppText
        size={large ? 17 : 14}
        weight="semibold"
        tabular
        color={color}
        align="center"
        style={{ minWidth: large ? 70 : 56 }}>
        ⏱️ {mins} min
      </AppText>
      <Pressable
        onPress={() => onChange(mins + 1)}
        disabled={mins >= max}
        accessibilityLabel={label ? `More time ${label.toLowerCase()}` : 'More time'}
        style={[button, mins >= max && styles.disabled]}>
        <AppText size={large ? 20 : 16} weight="semibold" color={color}>
          +
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  button: {
    borderWidth: 2,
    borderColor: colors.parentBorder,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  largeButton: { backgroundColor: colors.parentGround },
  disabled: { opacity: 0.4 },
});
