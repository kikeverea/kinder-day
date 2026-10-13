import { Text, type TextProps } from 'react-native';

import { colors, fonts } from '@/theme/tokens';

type Props = TextProps & {
  size?: number;
  weight?: keyof typeof fonts;
  color?: string;
  /** Fixed-width digits for timers and counters. */
  tabular?: boolean;
  align?: 'left' | 'center' | 'right';
};

/** Fredoka text. Weight maps to a loaded font family (Android can't synthesize weights). */
export function AppText({
  size = 16,
  weight = 'medium',
  color = colors.ink,
  tabular,
  align,
  style,
  ...rest
}: Props) {
  return (
    <Text
      {...rest}
      style={[
        {
          fontFamily: fonts[weight],
          fontSize: size,
          color,
          textAlign: align,
          fontVariant: tabular ? ['tabular-nums'] : undefined,
        },
        style,
      ]}
    />
  );
}
