import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { useIsActive, useReorderableDrag } from 'react-native-reorderable-list';

import { AppText } from '@/components/app-text';
import { Emoji } from '@/components/emoji';
import { colors } from '@/theme/tokens';

export const PLANNER_ROW_HEIGHT = 64;
const GAP = 10;

type Props = {
  position: number;
  name: string;
  emoji: string;
  color: string;
  summary: string;
  onRemove: () => void;
  /** Today's result face, if this routine was finished today. */
  badge?: string;
  onBadgePress?: () => void;
};

/** Week planner row. Must render inside a reorderable list with `shouldUpdateActiveItem`. */
export function PlannerRow({ position, name, emoji, color, summary, onRemove, badge, onBadgePress }: Props) {
  const drag = useReorderableDrag();
  const active = useIsActive();

  return (
    <View style={styles.cell}>
      <View style={[styles.row, active && styles.active]}>
        <Pressable onPressIn={drag} accessibilityLabel={`Drag ${name} to reorder`} hitSlop={8} style={styles.handle}>
          <MaterialIcons name="drag-indicator" size={24} color={colors.softLabel} />
        </Pressable>
        <View style={[styles.icon, { backgroundColor: color }]}>
          <Emoji size={22}>{emoji}</Emoji>
        </View>
        <View style={styles.body}>
          <AppText size={17} weight="semibold" numberOfLines={1}>
            {position}. {name}
          </AppText>
          <AppText size={13} color={colors.muted} numberOfLines={1}>
            {summary}
          </AppText>
        </View>
        {badge ? (
          <Pressable onPress={onBadgePress} accessibilityLabel={`${name}: change result face`} style={styles.badge}>
            <Emoji size={26}>{badge}</Emoji>
          </Pressable>
        ) : null}
        <Pressable onPress={onRemove} accessibilityLabel={`Remove ${name} from this day`} style={styles.remove}>
          <AppText size={16} color={colors.muted}>
            ✕
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cell: { paddingBottom: GAP },
  row: {
    height: PLANNER_ROW_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.parentBorder,
    borderRadius: 18,
    paddingLeft: 6,
    paddingRight: 8,
  },
  active: { borderColor: colors.ink, boxShadow: '0 12px 24px rgba(43, 35, 64, 0.22)' },
  handle: { width: 26, height: 44, alignItems: 'center', justifyContent: 'center' },
  icon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, minWidth: 0 },
  badge: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  remove: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.parentGround,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
