import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Emoji } from '@/components/emoji';
import { colors, sticker } from '@/theme/tokens';

import { StickerPressable } from './sticker-pressable';

type Props = {
  name: string;
  emoji: string;
  color: string;
  countLabel: string;
  /** Today's result emoji (😄/👀/😬), if the routine was finished. */
  badge?: string;
  /** A step's timer is ticking: shows a timer badge. */
  running?: boolean;
  width: number;
  /** Omitted for read-only tiles (past days). */
  onPress?: () => void;
};

export function RoutineCard({ name, emoji, color, countLabel, badge, running, width, onPress }: Props) {
  return (
    <StickerPressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityLabel={`${name}, ${countLabel}${running ? ', in progress' : ''}`}
      style={{ width }}
      faceStyle={[styles.face, { backgroundColor: color }]}>
      <View style={styles.well}>
        <Emoji size={56}>{emoji}</Emoji>
      </View>
      <AppText size={24} weight="semibold" align="center" style={styles.name}>
        {name}
      </AppText>
      <View style={styles.count}>
        <AppText size={14} weight="semibold">
          {countLabel}
        </AppText>
      </View>
      {running ? (
        <View style={[styles.badge, styles.timer]}>
          <MaterialIcons name="timer" size={26} color={colors.ink} />
        </View>
      ) : null}
      {badge ? (
        <View style={styles.badge}>
          <Emoji size={26}>{badge}</Emoji>
        </View>
      ) : null}
    </StickerPressable>
  );
}

const styles = StyleSheet.create({
  face: { alignItems: 'center', gap: 10, paddingTop: 18, paddingBottom: 16, paddingHorizontal: 10 },
  well: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: sticker.border,
    borderColor: colors.ink,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { lineHeight: 26 },
  count: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 99,
    paddingHorizontal: 12,
    paddingVertical: 2,
  },
  badge: {
    position: 'absolute',
    top: -12,
    right: -8,
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: sticker.border,
    borderColor: colors.ink,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timer: { right: undefined, left: -8 },
});
