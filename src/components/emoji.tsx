import { Text } from 'react-native';

/**
 * System emoji (Noto Color Emoji on most Android phones).
 * Every emoji goes through here so switching to bundled images later is a one-file change.
 */
export function Emoji({ children, size }: { children: string; size: number }) {
  return (
    <Text
      style={{ fontSize: size, lineHeight: size * 1.2, textAlign: 'center', includeFontPadding: false }}
      accessibilityElementsHidden
      importantForAccessibility="no">
      {children}
    </Text>
  );
}
