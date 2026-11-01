import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Emoji } from '@/components/emoji';
import { colors } from '@/theme/tokens';

import { Card } from './card';

type Props = {
  name: string;
  emoji: string;
  color: string;
  done: number;
  total: number;
  status: string;
  /** Result face; with a result, the face and sticker buttons show. */
  badge?: string;
  /** Reward sticker given to the result, if any. */
  sticker?: string | null;
  onFacePress: () => void;
  onStickerPress: () => void;
};

/** Parent · Today: one of today's routines with its progress and result (face, then sticker below). */
export function TodayRow({
  name,
  emoji,
  color,
  done,
  total,
  status,
  badge,
  sticker,
  onFacePress,
  onStickerPress,
}: Props) {
  return (
    <Card>
      <View style={[styles.icon, { backgroundColor: color }]}>
        <Emoji size={28}>{emoji}</Emoji>
      </View>
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <AppText size={18} weight="semibold" numberOfLines={1} style={styles.name}>
            {name}
          </AppText>
          <AppText size={15} color={colors.muted} tabular>
            {done} of {total}
          </AppText>
        </View>
        <View style={styles.track}>
          <View
            style={[
              styles.fill,
              { width: `${total ? (done / total) * 100 : 0}%`, backgroundColor: color },
            ]}
          />
        </View>
        <AppText size={14} color={colors.muted}>
          {status}
        </AppText>
      </View>
      {badge ? (
        <View style={styles.result}>
          <Pressable
            onPress={onFacePress}
            accessibilityRole="button"
            accessibilityLabel={`${name}: change result face`}
            style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
            <Emoji size={28}>{badge}</Emoji>
          </Pressable>
          <Pressable
            onPress={onStickerPress}
            accessibilityRole="button"
            accessibilityLabel={sticker ? `${name}: change sticker` : `${name}: give a sticker`}
            style={({ pressed }) => [styles.button, !sticker && styles.empty, pressed && styles.pressed]}>
            {sticker ? (
              <Emoji size={28}>{sticker}</Emoji>
            ) : (
              <MaterialIcons name="add-reaction" size={24} color={colors.softLabel} />
            )}
          </Pressable>
        </View>
      ) : (
        <View style={styles.button} />
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  icon: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, minWidth: 0, gap: 6 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  name: { flex: 1 },
  track: { height: 10, borderRadius: 99, backgroundColor: colors.pressedTint, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 99 },
  result: { gap: 6 },
  button: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: colors.parentGround,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: { borderWidth: 2, borderStyle: 'dashed', borderColor: colors.dashed },
  pressed: { backgroundColor: colors.pressedTint },
});
