import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { ScrollViewContainer } from 'react-native-reorderable-list';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/app-text';
import { DashedButton } from '@/components/parent/dashed-button';
import { FacePickerModal } from '@/components/parent/face-picker-modal';
import { ParentHeader } from '@/components/parent/parent-header';
import { RoutineRow } from '@/components/parent/routine-row';
import { SegmentedControl } from '@/components/parent/segmented-control';
import { StickerPickerModal } from '@/components/parent/sticker-picker-modal';
import { TodayRow } from '@/components/parent/today-row';
import { WeekPlanner } from '@/components/parent/week-planner';
import { DAY_NAME, FACE_EMOJI } from '@/domain/constants';
import { dayOfWeek } from '@/domain/day';
import { daysLabel, routineSummary, todayStatus } from '@/domain/format';
import { completion, resultFace } from '@/domain/progress';
import { routinesForDay } from '@/domain/schedule';
import type { Routine } from '@/domain/types';
import { useNow } from '@/hooks/use-now';
import { useAppStore } from '@/store';
import { colors, spacing } from '@/theme/tokens';

const TABS = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'Week' },
  { key: 'routines', label: 'Routines' },
] as const;
type Tab = (typeof TABS)[number]['key'];

export default function ParentHome() {
  const [tab, setTab] = useState<Tab>('today');
  const [faceFor, setFaceFor] = useState<Routine | null>(null);
  const [stickerFor, setStickerFor] = useState<Routine | null>(null);
  const kidName = useAppStore((s) => s.settings.kidName);
  const lockParent = useAppStore((s) => s.lockParent);
  const results = useAppStore((s) => s.results);
  const setResultFace = useAppStore((s) => s.setResultFace);
  const setResultSticker = useAppStore((s) => s.setResultSticker);
  const faceResult = faceFor ? results[faceFor.id] : undefined;
  const stickerResult = stickerFor ? results[stickerFor.id] : undefined;

  const toKidMode = () => {
    router.dismissTo('/');
    lockParent();
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      {/* ScrollViewContainer (a ScrollView) lets the week planner's drag list autoscroll the page. */}
      <ScrollViewContainer contentContainerStyle={styles.content}>
        <ParentHeader kidName={kidName} onKidMode={toKidMode} onSettings={() => router.push('/parent/settings')} />
        <SegmentedControl options={TABS} value={tab} onChange={setTab} />
        {tab === 'today' ? (
          <TodayTab onFacePress={setFaceFor} onStickerPress={setStickerFor} />
        ) : tab === 'routines' ? (
          <RoutinesTab />
        ) : (
          <WeekTab onFacePress={setFaceFor} />
        )}
      </ScrollViewContainer>
      <FacePickerModal
        target={faceFor && faceResult ? { name: faceFor.name, emoji: faceFor.emoji, result: faceResult } : null}
        onPick={(face) => {
          if (faceFor) setResultFace(faceFor.id, face);
          setFaceFor(null);
        }}
        onClose={() => setFaceFor(null)}
      />
      <StickerPickerModal
        target={
          stickerFor && stickerResult
            ? { name: stickerFor.name, emoji: stickerFor.emoji, result: stickerResult }
            : null
        }
        onPick={(sticker) => {
          if (stickerFor) setResultSticker(stickerFor.id, sticker);
          setStickerFor(null);
        }}
        onClose={() => setStickerFor(null)}
      />
    </SafeAreaView>
  );
}

type FaceProps = { onFacePress: (routine: Routine) => void };

function TodayTab({
  onFacePress,
  onStickerPress,
}: FaceProps & { onStickerPress: (routine: Routine) => void }) {
  const routines = useAppStore((s) => s.routines);
  const dayOrder = useAppStore((s) => s.dayOrder);
  const runs = useAppStore((s) => s.runs);
  const results = useAppStore((s) => s.results);
  const resetToday = useAppStore((s) => s.resetToday);
  const now = useNow();
  const today = dayOfWeek(now);
  const todays = routinesForDay(routines, dayOrder, today);

  const confirmReset = () =>
    Alert.alert('Reset today?', "This clears today's progress, timers and results.", [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: () => resetToday() },
    ]);

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <AppText size={20} weight="semibold">
          Today · {DAY_NAME[today]}
        </AppText>
        <Pressable onPress={confirmReset} hitSlop={8} accessibilityRole="button">
          <AppText size={15} color={colors.muted} style={styles.link}>
            Reset today
          </AppText>
        </Pressable>
      </View>
      {todays.length === 0 ? (
        <AppText size={16} color={colors.muted} style={styles.empty}>
          Nothing planned today.
        </AppText>
      ) : (
        todays.map((r) => {
          const { done, total } = completion(r, runs[r.id]);
          const result = results[r.id];
          return (
            <TodayRow
              key={r.id}
              name={r.name}
              emoji={r.emoji}
              color={r.color}
              done={done}
              total={total}
              status={todayStatus(!!runs[r.id], result)}
              badge={result ? FACE_EMOJI[resultFace(result)] : undefined}
              sticker={result?.sticker}
              onFacePress={() => onFacePress(r)}
              onStickerPress={() => onStickerPress(r)}
            />
          );
        })
      )}
    </View>
  );
}

function RoutinesTab() {
  const routines = useAppStore((s) => s.routines);
  const edit = (id: string) => router.push({ pathname: '/parent/edit/[id]', params: { id } });

  return (
    <View style={styles.section}>
      <AppText size={20} weight="semibold">
        All routines
      </AppText>
      {routines.map((r) => (
        <RoutineRow
          key={r.id}
          name={r.name}
          emoji={r.emoji}
          color={r.color}
          summary={routineSummary(r)}
          days={daysLabel(r.days)}
          onPress={() => edit(r.id)}
        />
      ))}
      <DashedButton label="+ New routine" onPress={() => edit('new')} />
    </View>
  );
}

function WeekTab({ onFacePress }: FaceProps) {
  const now = useNow();
  return <WeekPlanner today={dayOfWeek(now)} onFacePress={onFacePress} />;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.parentGround },
  content: { paddingHorizontal: spacing.screenX, paddingTop: 16, paddingBottom: 32, gap: 22 },
  section: { gap: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  link: { textDecorationLine: 'underline' },
  empty: { paddingVertical: 8, paddingHorizontal: 2 },
});
