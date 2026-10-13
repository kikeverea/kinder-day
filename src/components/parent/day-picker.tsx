import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { DAY_NAME, DAY_SHORT, WEEK } from '@/domain/constants';
import { daysLabel } from '@/domain/format';
import type { DayOfWeek } from '@/domain/types';
import { colors } from '@/theme/tokens';

type Props = {
  days: DayOfWeek[];
  onToggleDay: (day: DayOfWeek) => void;
  onToggleEveryDay: () => void;
};

/** Editor "Days": Every day switch, M–S toggles and a summary line. */
export function DayPicker({ days, onToggleDay, onToggleEveryDay }: Props) {
  const every = days.length === 7;
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <AppText size={17} weight="semibold">
          Days
        </AppText>
        <Pressable
          onPress={onToggleEveryDay}
          accessibilityRole="switch"
          accessibilityState={{ checked: every }}
          style={styles.everyDay}>
          <AppText size={15}>Every day</AppText>
          <View style={[styles.track, { backgroundColor: every ? colors.ink : colors.dashed }]}>
            <View style={[styles.knob, { left: every ? 19 : 3 }]} />
          </View>
        </Pressable>
      </View>
      <View style={styles.days}>
        {WEEK.map((d) => {
          const on = days.includes(d);
          return (
            <Pressable
              key={d}
              onPress={() => onToggleDay(d)}
              accessibilityLabel={DAY_NAME[d]}
              accessibilityState={{ selected: on }}
              style={[
                styles.day,
                { backgroundColor: on ? colors.ink : colors.white, borderColor: on ? colors.ink : colors.parentBorder },
              ]}>
              <AppText size={16} weight="semibold" color={on ? colors.white : colors.ink}>
                {DAY_SHORT[d]}
              </AppText>
            </Pressable>
          );
        })}
      </View>
      <AppText size={13} color={colors.muted}>
        {daysLabel(days)}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 10 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  everyDay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 36,
    paddingLeft: 12,
    paddingRight: 6,
    borderRadius: 99,
    borderWidth: 2,
    borderColor: colors.parentBorder,
    backgroundColor: colors.white,
  },
  track: { width: 40, height: 24, borderRadius: 99 },
  knob: { position: 'absolute', top: 3, width: 18, height: 18, borderRadius: 9, backgroundColor: colors.white },
  days: { flexDirection: 'row', gap: 6 },
  day: { flex: 1, height: 44, borderRadius: 14, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
});
