/** Design tokens from the Kid Routines handoff. Design canvas: 412dp-wide Android phone. */

export const colors = {
  ink: '#2B2340', // text, all outlines, hard shadows
  muted: '#6b5f80',
  secondary: '#4a3f5e',
  accentMuted: '#5a4a86',
  softLabel: '#9a8cb8',
  white: '#FFFFFF',

  kidGround: '#FFF6EA',
  parentGround: '#F7F4FB',

  parentBorder: '#e3dcef',
  pressedTint: '#efeaf6',
  pressedTintSoft: '#f3eff9',
  dashed: '#d8cfe6',
  segmentedTrack: '#ebe5f3',

  lock: '#FFD66B', // lock fill & "Kid mode" button

  dangerText: '#a33a3a',
  dangerBg: '#FBEDED',
  dangerBorder: '#e3b8b8',

  overtimeText: '#C2346E',
  overtimeRing: '#FF9EC7',
  celebrate: '#FF9EC7', // "I did it! 🎉" button

  result: { good: '#FFE9A8', regular: '#D9ECFF', bad: '#FFDCCB' },
  mode: {
    max: { bg: '#FFF3C4', border: '#F0D26B' },
    exact: { bg: '#DDEEFF', border: '#8EC9FF' },
  },
} as const;

export const fonts = {
  regular: 'Fredoka_400Regular',
  medium: 'Fredoka_500Medium',
  semibold: 'Fredoka_600SemiBold',
  bold: 'Fredoka_700Bold',
} as const;

export const spacing = {
  screenX: 20,
  gridRowGap: 18,
  gridColGap: 16,
  kidListGap: 14,
  parentListGap: 10,
} as const;

/** "Sticker" shape language (kid side): thick ink borders and a hard, unblurred offset shadow. */
export const sticker = {
  border: 3,
  radius: { row: 22, card: 28 },
  /** Hard shadow offset in dp; collapses to `pressed` while touched. */
  shadow: { card: 6, row: 5, small: 4, pressed: 1 },
  pressTranslate: 5,
  pressMs: 120,
} as const;

/** Parent side: softer, no shadow. */
export const parentCard = { border: 2, radius: 20 } as const;
