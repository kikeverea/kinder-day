import { Pressable, StyleSheet } from 'react-native';

import { AppText } from '@/components/app-text';
import { STEP_MODES } from '@/domain/constants';
import type { StepMode } from '@/domain/types';
import { colors } from '@/theme/tokens';

/** "⚡ Up to" / "⏳ Exactly" — tap toggles. */
export function ModeChip({
  mode,
  onPress,
  large,
}: {
  mode: StepMode;
  onPress: () => void;
  large?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityHint={STEP_MODES[mode].hint}
      style={[
        styles.chip,
        large && styles.large,
        { backgroundColor: colors.mode[mode].bg, borderColor: colors.mode[mode].border },
      ]}>
      <AppText size={large ? 15 : 13} weight="semibold">
        {STEP_MODES[mode].label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: { height: 28, paddingHorizontal: 10, borderRadius: 99, borderWidth: 2, justifyContent: 'center' },
  large: { height: 36, paddingHorizontal: 14 },
});
