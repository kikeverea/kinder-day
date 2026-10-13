import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { MAX_STEP_MINS, MIN_STEP_MINS } from '@/domain/constants';
import { colors } from '@/theme/tokens';

type Props = { mins: number; onChange: (mins: number) => void; large?: boolean };

/** − ⏱️ 3 min + (1–60) */
export function MinutesStepper({ mins, onChange, large }: Props) {
  const size = large ? 36 : 28;
  const button = [
    styles.button,
    { width: size, height: size, borderRadius: size / 2 },
    large && styles.largeButton,
  ];
  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => onChange(mins - 1)}
        disabled={mins <= MIN_STEP_MINS}
        accessibilityLabel="Less time"
        style={[button, mins <= MIN_STEP_MINS && styles.disabled]}>
        <AppText size={large ? 20 : 16} weight="semibold" color={large ? colors.ink : colors.accentMuted}>
          −
        </AppText>
      </Pressable>
      <AppText
        size={large ? 17 : 14}
        weight="semibold"
        tabular
        color={large ? colors.ink : colors.accentMuted}
        align="center"
        style={{ minWidth: large ? 70 : 56 }}>
        ⏱️ {mins} min
      </AppText>
      <Pressable
        onPress={() => onChange(mins + 1)}
        disabled={mins >= MAX_STEP_MINS}
        accessibilityLabel="More time"
        style={[button, mins >= MAX_STEP_MINS && styles.disabled]}>
        <AppText size={large ? 20 : 16} weight="semibold" color={large ? colors.ink : colors.accentMuted}>
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
