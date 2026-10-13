import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, parentCard } from '@/theme/tokens';

type Props = {
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

/** Parent-side card: soft 2dp border, radius 20, no shadow. Pressable when `onPress` is given. */
export function Card({ children, onPress, style, accessibilityLabel }: Props) {
  if (!onPress) return <View style={[styles.card, style]}>{children}</View>;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [styles.card, pressed && styles.pressed, style]}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.white,
    borderWidth: parentCard.border,
    borderColor: colors.parentBorder,
    borderRadius: parentCard.radius,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  pressed: { backgroundColor: colors.pressedTintSoft },
});
