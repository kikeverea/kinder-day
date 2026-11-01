import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Emoji } from '@/components/emoji';
import type { StepMode } from '@/domain/types';
import { colors } from '@/theme/tokens';

type Saved = { id: string; emoji: string; label: string; mins: number; mode?: StepMode };

type Props<T extends Saved> = {
  /** "saved steps" / "saved add-ons": the title and the remove prompt. */
  noun: string;
  templates: T[];
  onPick: (template: T) => void;
  onDelete: (templateId: string) => void;
};

/** Saved steps or add-ons in an Add box: tap adds a copy to the routine, hold offers to remove it. */
export function SavedChips<T extends Saved>({ noun, templates, onPick, onDelete }: Props<T>) {
  if (templates.length === 0) return null;

  const confirmDelete = (t: T) =>
    Alert.alert(`Remove “${t.label}” from ${noun}?`, 'Routines that already use it keep it.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => onDelete(t.id) },
    ]);

  return (
    <View style={styles.section}>
      <AppText size={13} color={colors.muted}>
        {noun[0].toUpperCase() + noun.slice(1)} · tap to add, hold to remove
      </AppText>
      <View style={styles.chips}>
        {templates.map((t) => (
          <Pressable
            key={t.id}
            onPress={() => onPick(t)}
            onLongPress={() => confirmDelete(t)}
            accessibilityRole="button"
            accessibilityLabel={`Add ${t.label}`}
            accessibilityHint={`Hold to remove it from ${noun}`}
            style={({ pressed }) => [
              styles.chip,
              { borderColor: t.mode ? colors.mode[t.mode].border : colors.parentBorder },
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
