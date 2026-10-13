import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from '@/components/app-text';
import { colors } from '@/theme/tokens';

type Props = {
  label: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  size?: number;
};

/** Dashed "add" affordance: "+ New routine", "+ After school"… */
export function DashedButton({ label, onPress, style, size = 18 }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.button, pressed && styles.pressed, style]}>
      <AppText size={size} weight="semibold" color={colors.accentMuted}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 60,
    borderWidth: 2.5,
    borderStyle: 'dashed',
    borderColor: colors.softLabel,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { backgroundColor: colors.pressedTint },
});
