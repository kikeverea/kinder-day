import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { NestedReorderableList, type ReorderableListReorderEvent } from 'react-native-reorderable-list';

import { AppText } from '@/components/app-text';
import { Emoji } from '@/components/emoji';
import { ALL_DAYS, DAY_NAME, FACE_EMOJI } from '@/domain/constants';
import { plannerSummary } from '@/domain/format';
import { resultFace } from '@/domain/progress';
import { moveItem, routinesForDay } from '@/domain/schedule';
import type { DayOfWeek, Routine } from '@/domain/types';
import { useAppStore } from '@/store';
import { colors } from '@/theme/tokens';

import { PlannerRow } from './planner-row';
import { WeekDayPicker } from './week-day-picker';

/** Parent · Week: per-day routine order (drag), remove from a day, add to a day. */
type Props = {
  today: DayOfWeek;
  /** Tap on a result face (today only). */
  onFacePress: (routine: Routine) => void;
};

export function WeekPlanner({ today, onFacePress }: Props) {
  const [day, setDay] = useState<DayOfWeek>(today);
  const routines = useAppStore((s) => s.routines);
  const dayOrder = useAppStore((s) => s.dayOrder);
  const reorderDay = useAppStore((s) => s.reorderDay);
  const removeRoutineFromDay = useAppStore((s) => s.removeRoutineFromDay);
  const addRoutineToDay = useAppStore((s) => s.addRoutineToDay);
  // Results only exist for today, so faces show on today's list.
  const results = useAppStore((s) => s.results);

  const planned = routinesForDay(routines, dayOrder, day);
  const others = routines.filter((r) => !r.days.includes(day));
  const counts = Object.fromEntries(
    ALL_DAYS.map((d) => [d, routinesForDay(routines, dayOrder, d).length]),
  ) as Record<DayOfWeek, number>;

  const onReorder = ({ from, to }: ReorderableListReorderEvent) =>
    reorderDay(
      day,
      moveItem(
        planned.map((r) => r.id),
        from,
        to,
      ),
    );

  return (
    <View style={styles.section}>
      <WeekDayPicker selected={day} today={today} counts={counts} onSelect={setDay} />

      <View style={styles.header}>
        <AppText size={22} weight="semibold">
          {DAY_NAME[day]}
        </AppText>
        {planned.length > 1 ? (
          <AppText size={14} color={colors.muted}>
            Drag ⠿ to reorder
          </AppText>
        ) : null}
      </View>

      {planned.length === 0 ? (
        <View style={styles.empty}>
          <AppText size={16} color={colors.muted} align="center">
            Nothing planned. Add a routine below.
          </AppText>
        </View>
      ) : (
        // The page scrolls, not the list; scrollEnabled={false} marks the nesting as intentional.
        <NestedReorderableList
          scrollEnabled={false}
          shouldUpdateActiveItem
          cellAnimations={{ opacity: 1 }}
          data={planned}
          keyExtractor={(r) => r.id}
          onReorder={onReorder}
          renderItem={({ item, index }) => {
            const result = day === today ? results[item.id] : undefined;
            return (
            <PlannerRow
              position={index + 1}
              name={item.name}
              emoji={item.emoji}
              color={item.color}
              summary={plannerSummary(item)}
              onRemove={() => removeRoutineFromDay(item.id, day)}
              badge={result ? FACE_EMOJI[resultFace(result)] : undefined}
              onBadgePress={() => onFacePress(item)}
            />
            );
          }}
        />
      )}

      {others.length > 0 ? (
        <View style={styles.add}>
          <AppText size={15} color={colors.muted}>
            Add to {DAY_NAME[day]}
          </AppText>
          <View style={styles.chips}>
            {others.map((r) => (
              <Pressable
                key={r.id}
                onPress={() => addRoutineToDay(r.id, day)}
                accessibilityRole="button"
                accessibilityLabel={`Add ${r.name} to ${DAY_NAME[day]}`}
                style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}>
                <Emoji size={20}>{r.emoji}</Emoji>
                <AppText size={15} color={colors.accentMuted}>
                  + {r.name}
                </AppText>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 16 },
  header: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  empty: {
    padding: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.dashed,
    borderRadius: 18,
  },
  add: { gap: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 40,
    paddingLeft: 8,
    paddingRight: 14,
    borderRadius: 99,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.softLabel,
  },
  chipPressed: { backgroundColor: colors.pressedTint },
});
