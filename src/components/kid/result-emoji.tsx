import { StyleSheet, View } from 'react-native';
import Animated, { Easing, Keyframe, useReducedMotion } from 'react-native-reanimated';

import { Emoji } from '@/components/emoji';
import { FACE_EMOJI } from '@/domain/constants';
import type { Rating } from '@/domain/types';
import { colors } from '@/theme/tokens';

const pop = new Keyframe({
  0: { transform: [{ scale: 0 }, { rotate: '-20deg' }] },
  100: { transform: [{ scale: 1 }, { rotate: '0deg' }], easing: Easing.bezier(0.3, 1.6, 0.5, 1) },
}).duration(700);

const loop = (duration: `${number}s`) =>
  ({
    animationDuration: duration,
    animationDelay: '0.7s',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'ease-in-out',
  }) as const;

/** Looping idle animations from the design: never angry or sad. */
const LOOPS = {
  good: {
    // bob
    animationName: {
      '0%': { transform: [{ translateY: 0 }, { rotate: '-4deg' }] },
      '50%': { transform: [{ translateY: -14 }, { rotate: '4deg' }] },
      '100%': { transform: [{ translateY: 0 }, { rotate: '-4deg' }] },
    },
    ...loop('2.4s'),
  },
  regular: {
    // eyes glance left and right
    animationName: {
      '0%': { transform: [{ translateX: 0 }] },
      '30%': { transform: [{ translateX: 0 }] },
      '40%': { transform: [{ translateX: -18 }] },
      '60%': { transform: [{ translateX: -18 }] },
      '70%': { transform: [{ translateX: 18 }] },
      '90%': { transform: [{ translateX: 18 }] },
      '100%': { transform: [{ translateX: 0 }] },
    },
    ...loop('2.6s'),
  },
  bad: {
    // shake
    animationName: {
      '0%': { transform: [{ rotate: '0deg' }] },
      '20%': { transform: [{ rotate: '-7deg' }] },
      '40%': { transform: [{ rotate: '6deg' }] },
      '60%': { transform: [{ rotate: '-4deg' }] },
      '80%': { transform: [{ rotate: '3deg' }] },
      '100%': { transform: [{ rotate: '0deg' }] },
    },
    ...loop('1.6s'),
  },
} as const;

export function ResultEmoji({ rating }: { rating: Rating }) {
  const reduceMotion = useReducedMotion();
  return (
    <View style={styles.circle}>
      <Animated.View entering={reduceMotion ? undefined : pop}>
        <Animated.View style={reduceMotion ? undefined : LOOPS[rating]}>
          <Emoji size={140}>{FACE_EMOJI[rating]}</Emoji>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 4,
    borderColor: colors.ink,
    backgroundColor: colors.white,
    boxShadow: `0 8px 0 ${colors.ink}`,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
});
