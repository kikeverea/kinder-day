import { StyleSheet, View } from 'react-native';

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
  badge?: string;
  /** Opens the face picker (finished routines only). */
  onPress?: () => void;
};

/** Parent · Today: one of today's routines with its progress and result. */
export function TodayRow({ name, emoji, color, done, total, status, badge, onPress }: Props) {
  return (
    <Card onPress={onPress} accessibilityLabel={onPress ? `${name}: change result face` : undefined}>
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
      <View style={styles.badge}>{badge ? <Emoji size={30}>{badge}</Emoji> : null}</View>
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
  badge: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
