import { useEffect, type ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { colors, sticker } from '@/theme/tokens';

type Props = {
  children: ReactNode;
  onPress?: () => void;
  /** Hard shadow depth in dp. */
  shadow?: number;
  radius?: number;
  /** Colour of the shadow layer. */
  shadowColor?: string;
  /** Resting "pressed-in" state (e.g. a done step): shadow collapsed to 1dp. */
  sunk?: boolean;
  disabled?: boolean;
  /** Style of the outer box (size, margins, flex). */
  style?: StyleProp<ViewStyle>;
  /** Style of the face (background, padding, layout of children). */
  faceStyle?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

const press = { duration: sticker.pressMs, easing: Easing.out(Easing.quad) };
const settle = { duration: 200, easing: Easing.bezier(0.3, 1.5, 0.5, 1) };

/**
 * The kid-side "sticker": ink border plus a hard, unblurred offset shadow.
 * The shadow is a real ink layer behind the face (elevation blurs), so pressing can
 * slide the face down onto it.
 */
export function StickerPressable({
  children,
  onPress,
  shadow = sticker.shadow.card,
  radius = sticker.radius.card,
  shadowColor = colors.ink,
  sunk = false,
  disabled,
  style,
  faceStyle,
  accessibilityLabel,
}: Props) {
  const travel = shadow - sticker.shadow.pressed;
  const pressed = useSharedValue(0);
  const rest = useSharedValue(sunk ? 1 : 0);

  useEffect(() => {
    rest.value = withTiming(sunk ? 1 : 0, settle);
  }, [sunk, rest]);

  const faceAnim = useAnimatedStyle(() => ({
    transform: [{ translateY: Math.max(pressed.value, rest.value) * travel }],
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => (pressed.value = withTiming(1, press))}
      onPressOut={() => (pressed.value = withTiming(0, press))}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[{ paddingBottom: shadow }, style]}>
      <View
        style={[
          StyleSheet.absoluteFill,
          { top: shadow, borderRadius: radius, backgroundColor: shadowColor },
        ]}
      />
      <Animated.View
        style={[
          {
            flexGrow: 1,
            borderWidth: sticker.border,
            borderColor: colors.ink,
            borderRadius: radius,
            backgroundColor: colors.white,
          },
          faceStyle,
          faceAnim,
        ]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
