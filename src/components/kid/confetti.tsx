import { useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { cubicBezier } from 'react-native-reanimated';

import { ROUTINE_COLORS } from '@/domain/constants';
import { colors } from '@/theme/tokens';

const PIECES = 44;

type Piece = { left: number; delay: number; duration: number; size: number; color: string; round: boolean };

const makePieces = (): Piece[] =>
  Array.from({ length: PIECES }, (_, i) => ({
    left: Math.random() * 100,
    delay: Math.random() * 1.6,
    duration: 2.4 + Math.random() * 1.8,
    size: 8 + Math.random() * 10,
    color: ROUTINE_COLORS[i % ROUTINE_COLORS.length],
    round: Math.random() > 0.5,
  }));

/** One-shot confetti burst for a "good" result: routine-colour pieces with ink outlines. */
export function Confetti() {
  const { height } = useWindowDimensions();
  const [pieces] = useState(makePieces);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {pieces.map((p, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            top: 0,
            left: `${p.left}%`,
            width: p.size,
            height: p.round ? p.size : p.size * 1.6,
            backgroundColor: p.color,
            borderWidth: 2,
            borderColor: colors.ink,
            borderRadius: p.round ? p.size / 2 : 3,
            animationName: {
              '0%': { opacity: 1, transform: [{ translateY: -40 }, { rotate: '0deg' }] },
              '100%': { opacity: 0.9, transform: [{ translateY: height + 40 }, { rotate: '720deg' }] },
            },
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            animationTimingFunction: cubicBezier(0.3, 0.5, 0.6, 1),
            animationFillMode: 'both',
          }}
        />
      ))}
    </View>
  );
}
