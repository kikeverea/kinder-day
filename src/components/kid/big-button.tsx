import { StyleSheet } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';

import { AppText } from '@/components/app-text';
import { colors, sticker } from '@/theme/tokens';

import { StickerPressable } from './sticker-pressable';

const pulse = {
  animationName: {
    '0%': { transform: [{ scale: 1 }] },
    '50%': { transform: [{ scale: 1.04 }] },
    '100%': { transform: [{ scale: 1 }] },
  },
  animationDuration: '1.1s',
  animationIterationCount: 'infinite',
  animationTimingFunction: 'ease-in-out',
} as const;

type Props = {
  label: string;
  onPress: () => void;
  background?: string;
  color?: string;
  shadowColor?: string;
  height?: number;
  /** Gentle scale loop ("I did it! 🎉"). */
  pulsing?: boolean;
};

/** Full-width kid action button ("I'm finished", "Back home 🏠"…). */
export function BigButton({
  label,
  onPress,
  background = colors.white,
  color = colors.ink,
  shadowColor = colors.ink,
  height = 66,
  pulsing,
}: Props) {
  const reduceMotion = useReducedMotion();
  return (
    <Animated.View style={pulsing && !reduceMotion ? pulse : undefined}>
      <StickerPressable
        onPress={onPress}
        radius={sticker.radius.row}
        shadowColor={shadowColor}
        style={{ height: height + sticker.shadow.card }}
        faceStyle={[styles.face, { backgroundColor: background }]}>
        <AppText size={24} weight="semibold" color={color}>
          {label}
        </AppText>
      </StickerPressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  face: { alignItems: 'center', justifyContent: 'center' },
});
