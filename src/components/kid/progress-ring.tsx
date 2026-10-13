import { useEffect, type ReactNode } from 'react';
import { View } from 'react-native';
import Animated, { Easing, useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { colors } from '@/theme/tokens';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Props = {
  /** Outer diameter including the border. */
  size: number;
  border: number;
  /** Diameter of the white inner circle (including its border). */
  inner: number;
  innerBorder: number;
  /** 0–1 filled, drawn clockwise from 12 o'clock. */
  fraction: number;
  color: string;
  children: ReactNode;
};

/**
 * Countdown ring: the band between the outer border and the inner circle fills in `color`
 * over a light track (RN has no conic gradients, so it's an SVG stroke). Changes animate
 * linearly over 1s so the 1s timer ticks read as a continuous drain.
 */
export function ProgressRing({ size, border, inner, innerBorder, fraction, color, children }: Props) {
  const band = (size - border * 2 - inner) / 2;
  const r = inner / 2 + band / 2;
  const box = size - border * 2;
  const circumference = 2 * Math.PI * r;
  const value = useSharedValue(fraction);

  useEffect(() => {
    value.value = withTiming(fraction, { duration: 1000, easing: Easing.linear });
  }, [fraction, value]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - value.value),
  }));

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: border,
        borderColor: colors.ink,
        backgroundColor: colors.pressedTint,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Svg
        width={box}
        height={box}
        style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <AnimatedCircle
          cx={box / 2}
          cy={box / 2}
          r={r}
          stroke={color}
          strokeWidth={band + 1}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          animatedProps={animatedProps}
        />
      </Svg>
      <View
        style={{
          width: inner,
          height: inner,
          borderRadius: inner / 2,
          borderWidth: innerBorder,
          borderColor: colors.ink,
          backgroundColor: colors.white,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        {children}
      </View>
    </View>
  );
}
