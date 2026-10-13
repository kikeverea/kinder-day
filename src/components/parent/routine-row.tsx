import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Emoji } from '@/components/emoji';
import { colors } from '@/theme/tokens';

import { Card } from './card';

type Props = {
  name: string;
  emoji: string;
  color: string;
  summary: string;
  days: string;
  onPress: () => void;
};

/** Parent · Routines: a routine with its steps summary and schedule; opens the editor. */
export function RoutineRow({ name, emoji, color, summary, days, onPress }: Props) {
  return (
    <Card onPress={onPress} accessibilityLabel={`Edit ${name}`}>
      <View style={[styles.icon, { backgroundColor: color }]}>
        <Emoji size={24}>{emoji}</Emoji>
      </View>
      <View style={styles.body}>
        <AppText size={18} weight="semibold" numberOfLines={1}>
          {name}
        </AppText>
        <AppText size={14} color={colors.muted} numberOfLines={1}>
          {summary}
        </AppText>
        <AppText size={13} color={colors.accentMuted}>
          📆 {days}
        </AppText>
      </View>
      <AppText size={15} color={colors.accentMuted}>
        Edit ›
      </AppText>
    </Card>
  );
}

const styles = StyleSheet.create({
  icon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, minWidth: 0 },
});
