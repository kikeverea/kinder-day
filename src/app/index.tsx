import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { dayOfWeek } from '@/domain/day';
import { greeting } from '@/domain/format';
import { completion } from '@/domain/progress';
import { routinesForDay } from '@/domain/schedule';
import { useNow } from '@/hooks/use-now';
import { useAppStore } from '@/store';
import { colors, fonts, spacing, sticker } from '@/theme/tokens';

// Phase 0 placeholder: proves fonts, tokens and persisted store are wired. Replaced by Kid Home in phase 2.
export default function KidHome() {
  const routines = useAppStore((s) => s.routines);
  const dayOrder = useAppStore((s) => s.dayOrder);
  const progress = useAppStore((s) => s.progress);
  const kidName = useAppStore((s) => s.settings.kidName);

  const now = useNow();
  const hello = greeting(new Date(now).getHours());
  const todays = routinesForDay(routines, dayOrder, dayOfWeek(now));

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.greeting}>{hello.text}</Text>
        <Text style={styles.name}>
          {kidName}! {hello.emoji}
        </Text>
        {todays.map((r) => {
          const { done, total } = completion(r, progress);
          return (
            <View key={r.id} style={[styles.card, { backgroundColor: r.color }]}>
              <Text style={styles.cardTitle}>
                {r.emoji} {r.name}
              </Text>
              <Text style={styles.cardMeta}>
                {done} of {total}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.kidGround },
  content: { paddingHorizontal: spacing.screenX, paddingVertical: 24, gap: spacing.kidListGap },
  greeting: { fontFamily: fonts.medium, fontSize: 20, color: colors.muted },
  name: { fontFamily: fonts.bold, fontSize: 44, color: colors.ink, marginBottom: 12 },
  card: {
    padding: 20,
    borderWidth: sticker.border,
    borderColor: colors.ink,
    borderRadius: sticker.radius.card,
    boxShadow: `0 ${sticker.shadow.card}px 0 ${colors.ink}`,
  },
  cardTitle: { fontFamily: fonts.semibold, fontSize: 24, color: colors.ink },
  cardMeta: { fontFamily: fonts.medium, fontSize: 15, color: colors.secondary },
});
