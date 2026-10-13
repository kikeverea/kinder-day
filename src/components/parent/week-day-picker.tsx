import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { DAY_NAME, DAY_SHORT, WEEK } from '@/domain/constants';
import type { DayOfWeek } from '@/domain/types';
import { colors } from '@/theme/tokens';

type Props = {
  selected: DayOfWeek;
  today: DayOfWeek;
  /** Routines scheduled per day. */
  counts: Record<DayOfWeek, number>;
  onSelect: (day: DayOfWeek) => void;
};

/** Mon→Sun buttons with each day's routine count; a dot marks today. */
export function WeekDayPicker({ selected, today, counts, onSelect }: Props) {
  return (
    <View style={styles.row}>
      {WEEK.map((d) => {
        const on = d === selected;
        const fg = on ? colors.white : colors.ink;
        return (
          <Pressable
            key={d}
            onPress={() => onSelect(d)}
            accessibilityLabel={`${DAY_NAME[d]}, ${counts[d]} routines`}
            accessibilityState={{ selected: on }}
            style={[
              styles.day,
              { backgroundColor: on ? colors.ink : colors.white, borderColor: on ? colors.ink : colors.parentBorder },
            ]}>
            <AppText size={15} weight="semibold" color={fg}>
              {DAY_SHORT[d]}
            </AppText>
            <AppText size={12} color={fg} style={styles.count}>
              {counts[d]}
            </AppText>
            <View
              style={[
                styles.dot,
                { backgroundColor: d === today ? (on ? colors.lock : colors.overtimeText) : 'transparent' },
              ]}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6 },
  day: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    paddingTop: 8,
    paddingBottom: 7,
    borderRadius: 16,
    borderWidth: 2,
  },
  count: { opacity: 0.8 },
  dot: { width: 5, height: 5, borderRadius: 3 },
});
