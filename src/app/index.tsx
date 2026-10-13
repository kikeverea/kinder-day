import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/app-text';
import { Emoji } from '@/components/emoji';
import { DaySwitcher } from '@/components/kid/day-switcher';
import { LockButton } from '@/components/kid/lock-button';
import { RoutineCard } from '@/components/kid/routine-card';
import { FACE_EMOJI } from '@/domain/constants';
import { dayKey, dayKeyToTime, dayOfWeek, shiftDay } from '@/domain/day';
import { dateLabel, greeting } from '@/domain/format';
import { oldestDay } from '@/domain/history';
import { completion, resultFace } from '@/domain/progress';
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
  const history = useAppStore((s) => s.history);
  const kidName = useAppStore((s) => s.settings.kidName);
  const parentUnlocked = useAppStore((s) => s.parentUnlocked);
  const unlockParent = useAppStore((s) => s.unlockParent);
  const lockParent = useAppStore((s) => s.lockParent);

  const now = useNow();
  const { width } = useWindowDimensions();
  const cardWidth = (width - spacing.screenX * 2 - spacing.gridColGap) / 2;
  const hello = greeting(new Date(now).getHours());
  const todayKey = dayKey(now);
  // null = today (live); otherwise a past dayKey from history.
  const [pastDay, setPastDay] = useState<string | null>(null);
  const shownKey = pastDay ?? todayKey;
  const oldest = oldestDay(history);
  const showDay = (key: string) => setPastDay(key >= todayKey ? null : key);

  // Today: live routines. Past day: the archived snapshot (read-only).
  const tiles = pastDay
    ? (history[pastDay]?.routines ?? []).map((r) => ({
        id: r.id,
        name: r.name,
        emoji: r.emoji,
        color: r.color,
        countLabel: `${r.doneSteps} of ${r.totalSteps}`,
        badge: r.result ? FACE_EMOJI[resultFace(r.result)] : undefined,
        running: false,
      }))
    : routinesForDay(routines, dayOrder, dayOfWeek(now)).map((r) => {
        const { done, total } = completion(r, runs[r.id]);
        const result = results[r.id];
        return {
          id: r.id,
          name: r.name,
          emoji: r.emoji,
          color: r.color,
          countLabel: `${done} of ${total}`,
          badge: result ? FACE_EMOJI[resultFace(result)] : undefined,
          running: isRoutineRunning(runs[r.id]),
        };
      });

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

        <DaySwitcher
          label={dateLabel(pastDay ? dayKeyToTime(pastDay) : now)}
          isToday={!pastDay}
          canGoBack={!!oldest && oldest < shownKey}
          onBack={() => showDay(shiftDay(shownKey, -1))}
          onForward={() => showDay(shiftDay(shownKey, 1))}
          onToday={() => setPastDay(null)}
        />

        <AppText size={24} weight="semibold">
          {pastDay ? 'What did we do?' : 'What are we doing now?'}
        </AppText>

        {tiles.length === 0 && pastDay ? (
          <View style={styles.empty}>
            <Emoji size={56}>🗓️</Emoji>
            <AppText size={22} weight="semibold">
              Nothing saved this day
            </AppText>
          </View>
        ) : tiles.length === 0 ? (
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
            {tiles.map((t) => (
              <RoutineCard
                key={t.id}
                name={t.name}
                emoji={t.emoji}
                color={t.color}
                countLabel={t.countLabel}
                badge={t.badge}
                running={t.running}
                width={cardWidth}
                onPress={
                  pastDay
                    ? undefined
                    : () => router.push({ pathname: '/routine/[id]', params: { id: t.id } })
                }
              />
            ))}
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
