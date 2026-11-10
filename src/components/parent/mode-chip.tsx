import { Pressable, StyleSheet } from 'react-native';

import { AppText } from '@/components/app-text';
import { NO_TIME_MODE, STEP_MODES } from '@/domain/constants';
import type { StepMode } from '@/domain/types';
import { colors } from '@/theme/tokens';

/** "⚡ Up to" (or "🌿 No time" without timer) / "⏳ Exactly" — tap toggles. */
export function ModeChip({
  mode,
  onPress,
  large,
  timed = true,
}: {
  mode: StepMode;
  onPress: () => void;
  large?: boolean;
  /** false: the routine has no timer, so a non-exact step is "No time". */
  timed?: boolean;
}) {
  const noTime = !timed && mode === 'max';
  const { label, hint } = noTime ? NO_TIME_MODE : STEP_MODES[mode];
  const tint = colors.mode[noTime ? 'noTime' : mode];
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityHint={hint}
      style={[styles.chip, large && styles.large, { backgroundColor: tint.bg, borderColor: tint.border }]}>
      <AppText size={large ? 15 : 13} weight="semibold">
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: { height: 28, paddingHorizontal: 10, borderRadius: 99, borderWidth: 2, justifyContent: 'center' },
  large: { height: 36, paddingHorizontal: 14 },
});
