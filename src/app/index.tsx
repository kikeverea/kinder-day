import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/app-text';
import { Emoji } from '@/components/emoji';
import { LockButton } from '@/components/kid/lock-button';
import { RoutineCard } from '@/components/kid/routine-card';
import { RESULT_EMOJI } from '@/domain/constants';
import { dayOfWeek } from '@/domain/day';
import { dateLabel, greeting } from '@/domain/format';
import { completion } from '@/domain/progress';
import { isRoutineRunning } from '@/domain/routine-run';
import { routinesForDay } from '@/domain/schedule';
import { useNow } from '@/hooks/use-now';
import { useAppStore } from '@/store';
import { colors, spacing, sticker } from '@/theme/tokens';

export default function KidHome() {
  const routines = useAppStore((s) => s.routines);
  const dayOrder = useAppStore((s) => s.dayOrder);
  const runs = useAppStore((s) => s.runs);
  const results = useAppStore((s) => s.results);
  const kidName = useAppStore((s) => s.settings.kidName);
  const parentUnlocked = useAppStore((s) => s.parentUnlocked);
  const unlockParent = useAppStore((s) => s.unlockParent);
  const lockParent = useAppStore((s) => s.lockParent);

  const now = useNow();
  const { width } = useWindowDimensions();
  const cardWidth = (width - spacing.screenX * 2 - spacing.gridColGap) / 2;
  const hello = greeting(new Date(now).getHours());
  const todays = routinesForDay(routines, dayOrder, dayOfWeek(now));

  // Coming back to Kid Home always re-locks the grown-ups area.
  useFocusEffect(
    useCallback(() => {
      lockParent();
    }, [lockParent]),
  );

  // Navigate once the unlock has rendered, so the protected route exists.
  useEffect(() => {
    if (parentUnlocked) router.push('/parent');
  }, [parentUnlocked]);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.hello}>
            <AppText size={20} color={colors.muted}>
              {hello.text}
            </AppText>
            <AppText size={44} weight="bold" style={styles.name}>
              {kidName}! {hello.emoji}
            </AppText>
          </View>
          <LockButton onUnlock={unlockParent} />
        </View>

        <View style={styles.date}>
          <View style={styles.dateIcon}>
            <Emoji size={18}>📅</Emoji>
          </View>
          <AppText size={17}>{dateLabel(now)}</AppText>
        </View>

        <AppText size={24} weight="semibold">
          What are we doing now?
        </AppText>

        {todays.length === 0 ? (
          <View style={styles.empty}>
            <Emoji size={56}>🎈</Emoji>
            <AppText size={22} weight="semibold">
              No routines today!
            </AppText>
            <AppText size={17} color={colors.muted}>
              Enjoy your free day.
            </AppText>
          </View>
        ) : (
          <View style={styles.grid}>
            {todays.map((r) => {
              const { done, total } = completion(r, runs[r.id]);
              const result = results[r.id];
              return (
                <RoutineCard
                  key={r.id}
                  name={r.name}
                  emoji={r.emoji}
                  color={r.color}
                  countLabel={`${done} of ${total}`}
                  badge={result ? RESULT_EMOJI[result.rating] : undefined}
                  running={isRoutineRunning(runs[r.id])}
                  width={cardWidth}
                  onPress={() => router.push({ pathname: '/routine/[id]', params: { id: r.id } })}
                />
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.kidGround },
  content: { paddingHorizontal: spacing.screenX, paddingTop: 16, paddingBottom: 32, gap: 22 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  hello: { flex: 1, gap: 2 },
  name: { lineHeight: 50 },
  date: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    alignSelf: 'flex-start',
    backgroundColor: colors.white,
    borderWidth: sticker.border,
    borderColor: colors.ink,
    borderRadius: 99,
    paddingVertical: 6,
    paddingLeft: 8,
    paddingRight: 16,
  },
  dateIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.lock,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderWidth: sticker.border,
    borderStyle: 'dashed',
    borderColor: colors.dashed,
    borderRadius: sticker.radius.card,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: spacing.gridColGap,
    rowGap: spacing.gridRowGap,
    paddingTop: 12, // room for result badges that overhang the first row
  },
});
