import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Emoji } from '@/components/emoji';
import type { Step } from '@/domain/types';
import { colors } from '@/theme/tokens';

type Props = {
  templates: Step[];
  onPick: (template: Step) => void;
  onDelete: (templateId: string) => void;
};

/** "Saved steps" chips in the Add box: tap adds that step to the routine, hold offers to remove it. */
export function SavedSteps({ templates, onPick, onDelete }: Props) {
  if (templates.length === 0) return null;

  const confirmDelete = (t: Step) =>
    Alert.alert(`Remove “${t.label}” from saved steps?`, 'Routines that already use it keep it.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => onDelete(t.id) },
    ]);

  return (
    <View style={styles.section}>
      <AppText size={13} color={colors.muted}>
        Saved steps · tap to add, hold to remove
      </AppText>
      <View style={styles.chips}>
        {templates.map((t) => (
          <Pressable
            key={t.id}
            onPress={() => onPick(t)}
            onLongPress={() => confirmDelete(t)}
            accessibilityRole="button"
            accessibilityLabel={`Add ${t.label}`}
            accessibilityHint="Hold to remove it from saved steps"
            style={({ pressed }) => [
              styles.chip,
              { borderColor: colors.mode[t.mode].border },
              pressed && styles.pressed,
            ]}>
            <Emoji size={18}>{t.emoji}</Emoji>
            <AppText size={15} weight="semibold" numberOfLines={1} style={styles.label}>
              {t.label}
            </AppText>
            <AppText size={13} color={colors.muted} tabular>
              {t.mins} min
            </AppText>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 8, paddingHorizontal: 4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    maxWidth: '100%',
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 99,
    borderWidth: 2,
    backgroundColor: colors.parentGround,
  },
  label: { flexShrink: 1 },
  pressed: { backgroundColor: colors.pressedTint },
});
