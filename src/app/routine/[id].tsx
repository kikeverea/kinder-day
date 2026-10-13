import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { LayoutAnimationConfig } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/app-text';
import { Emoji } from '@/components/emoji';
import { BigButton } from '@/components/kid/big-button';
import { FocusCard } from '@/components/kid/focus-card';
import { ProgressBar } from '@/components/kid/progress-bar';
import { StepRow } from '@/components/kid/step-row';
import { StickerPressable } from '@/components/kid/sticker-pressable';
import { TimerCard } from '@/components/kid/timer-card';
import { progressLabel } from '@/domain/format';
import { completion } from '@/domain/progress';
import { focusState, stepRow, timerCard, totalLeft } from '@/domain/timer';
import { useNow } from '@/hooks/use-now';
import { useAppStore } from '@/store';
import { routineTint } from '@/theme/color';
import { colors, spacing, sticker } from '@/theme/tokens';

export default function RoutineChecklist() {
  useKeepAwake();
  const { id } = useLocalSearchParams<{ id: string }>();
  const routine = useAppStore((s) => s.routines.find((r) => r.id === id));
  const run = useAppStore((s) => s.runs[id]);
  const openRoutine = useAppStore((s) => s.openRoutine);
  const toggleStep = useAppStore((s) => s.toggleStep);
  const pauseStep = useAppStore((s) => s.pauseStep);
  const resumeStep = useAppStore((s) => s.resumeStep);
  const finishRoutine = useAppStore((s) => s.finishRoutine);
  const now = useNow(1000);

  useEffect(() => {
    openRoutine(id);
  }, [id, openRoutine]);

  // Success haptic when an exact step finishes and focus mode closes.
  const focusId = routine ? focusState(routine, run, now)?.step.id : undefined;
  const lastFocusId = useRef(focusId);
  useEffect(() => {
    if (lastFocusId.current && !focusId) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    lastFocusId.current = focusId;
  }, [focusId]);

  if (!routine) return <Redirect href="/" />;

  const tint = routineTint(routine.color);
  const { done, total } = completion(routine, run);
  const allDone = total > 0 && done === total;
  const focus = focusState(routine, run, now);
  const card = timerCard(routine, run, now);

  const onStep = (stepId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleStep(routine.id, stepId);
  };

  const onFinish = () => {
    finishRoutine(routine.id);
    router.replace({ pathname: '/result/[id]', params: { id: routine.id } });
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: tint }]}>
      <View style={styles.header}>
        <StickerPressable
          onPress={() => router.back()}
          shadow={sticker.shadow.small}
          radius={26}
          accessibilityLabel="Back"
          style={styles.back}
          faceStyle={styles.center}>
          <AppText size={28} weight="semibold" style={styles.backGlyph}>
            ‹
          </AppText>
        </StickerPressable>
        <View style={[styles.routineIcon, { backgroundColor: routine.color }]}>
          <Emoji size={32}>{routine.emoji}</Emoji>
        </View>
        <AppText size={32} weight="bold" numberOfLines={1} style={styles.title}>
          {routine.name}
        </AppText>
      </View>

      <View style={styles.top}>
        <ProgressBar fraction={total ? done / total : 0} color={routine.color} />
        <AppText size={17} color={colors.secondary}>
          {progressLabel(done, total)}
        </AppText>
        {card ? <TimerCard card={card} totalLeft={totalLeft(routine, run, now)} color={routine.color} /> : null}
      </View>

      {focus ? (
        <View style={styles.focus}>
          <FocusCard
            focus={focus}
            color={routine.color}
            onPause={() => pauseStep(routine.id)}
            onResume={() => resumeStep(routine.id)}
          />
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.list}>
            {/* Skip the ✓ pop for steps that were already done when the screen opened. */}
            <LayoutAnimationConfig skipEntering>
              {routine.steps.map((step) => (
                <StepRow
                  key={step.id}
                  step={step}
                  row={stepRow(step, run, now)}
                  color={routine.color}
                  onPress={() => onStep(step.id)}
                />
              ))}
            </LayoutAnimationConfig>
          </ScrollView>
          <View style={[styles.footer, { backgroundColor: tint }]}>
            <BigButton
              label={allDone ? 'I did it! 🎉' : "I'm finished"}
              onPress={onFinish}
              background={allDone ? colors.celebrate : colors.ink}
              color={allDone ? colors.ink : colors.white}
              pulsing={allDone}
            />
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: spacing.screenX,
    paddingTop: 12,
  },
  back: { width: 52, height: 52 + sticker.shadow.small },
  center: { alignItems: 'center', justifyContent: 'center' },
  backGlyph: { lineHeight: 32, marginTop: -4 },
  routineIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: sticker.border,
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { flex: 1, lineHeight: 38 },
  top: { paddingHorizontal: spacing.screenX, paddingTop: 22, paddingBottom: 6, gap: 8 },
  focus: { flex: 1, paddingHorizontal: spacing.screenX, paddingTop: 14, paddingBottom: 24 },
  list: { paddingHorizontal: spacing.screenX, paddingTop: 10, paddingBottom: 8, gap: spacing.kidListGap },
  footer: { paddingHorizontal: spacing.screenX, paddingTop: 12, paddingBottom: 18 },
});
