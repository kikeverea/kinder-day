import * as Haptics from 'expo-haptics';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/app-text';
import { Emoji } from '@/components/emoji';
import { BigButton } from '@/components/kid/big-button';
import { Confetti } from '@/components/kid/confetti';
import { ResultEmoji } from '@/components/kid/result-emoji';
import { resultSubtitle, resultSummary, resultTitle } from '@/domain/format';
import { missedSteps } from '@/domain/today';
import { useAppStore } from '@/store';
import { colors, sticker } from '@/theme/tokens';

export default function Result() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const state = useAppStore();
  const routine = state.routines.find((r) => r.id === id);
  const result = state.results[id];

  useEffect(() => {
    if (result?.rating === 'good') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [result?.rating]);

  if (!routine || !result) return <Redirect href="/" />;

  const missed = missedSteps(state, routine.id);
  const good = result.rating === 'good';

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.result[result.rating] }]}>
      {good && state.settings.confetti ? <Confetti /> : null}
      <ScrollView contentContainerStyle={styles.content}>
        <ResultEmoji rating={result.rating} />
        <AppText size={52} weight="bold" align="center" style={styles.title}>
          {resultTitle(result)}
        </AppText>
        <AppText size={21} align="center" color={colors.secondary} style={styles.subtitle}>
          {resultSubtitle(result)}
        </AppText>
        <View style={styles.summary}>
          <Emoji size={22}>{routine.emoji}</Emoji>
          <AppText size={19} weight="semibold">
            {resultSummary(result)}
          </AppText>
        </View>

        {!good && missed.length > 0 ? (
          <View style={styles.missed}>
            <AppText size={17} weight="semibold" color={colors.secondary}>
              Still waiting for you:
            </AppText>
            <View style={styles.chips}>
              {missed.map((step) => (
                <View key={step.id} style={styles.chip}>
                  <Emoji size={22}>{step.emoji}</Emoji>
                  <AppText size={16}>{step.label}</AppText>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.spacer} />
        <View style={styles.buttons}>
          {!good ? (
            <BigButton
              label="Finish the rest 💪"
              onPress={() => router.replace({ pathname: '/routine/[id]', params: { id: routine.id } })}
              background={colors.ink}
              color={colors.white}
              shadowColor={colors.muted}
              height={64}
            />
          ) : null}
          <BigButton label="Back home 🏠" onPress={() => router.dismissTo('/')} height={64} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { flexGrow: 1, alignItems: 'center', gap: 18, paddingTop: 40, paddingBottom: 28, paddingHorizontal: 24 },
  title: { lineHeight: 56, marginTop: 14 },
  subtitle: { maxWidth: 300, lineHeight: 27 },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.white,
    borderWidth: sticker.border,
    borderColor: colors.ink,
    borderRadius: 99,
    paddingVertical: 6,
    paddingHorizontal: 18,
  },
  missed: { width: '100%', gap: 10, marginTop: 6, alignItems: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.white,
    borderWidth: 2.5,
    borderColor: colors.ink,
    borderRadius: 99,
    paddingVertical: 4,
    paddingLeft: 6,
    paddingRight: 14,
  },
  spacer: { flex: 1 },
  buttons: { width: '100%', gap: 14 },
});
