import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Emoji } from '@/components/emoji';
import type { AddOn } from '@/domain/types';
import { colors } from '@/theme/tokens';

import { MinutesStepper } from './minutes-stepper';

type Props = {
  addOn: AddOn;
  onMins: (mins: number) => void;
  onRemove: () => void;
  /** The add-on is saved for reuse exactly as it is (filled bookmark). */
  saved: boolean;
  onSaveTemplate: () => void;
};

/** Editor add-on: icon, label, minutes, save for reuse and remove. Add-ons only have a time (no mode, no buffers). */
export function AddOnEditorRow({ addOn, onMins, onRemove, saved, onSaveTemplate }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.icon}>
        <Emoji size={26}>{addOn.emoji}</Emoji>
      </View>
      <View style={styles.body}>
        <AppText size={18} style={styles.label}>
          {addOn.label}
        </AppText>
        <MinutesStepper mins={addOn.mins} onChange={onMins} />
      </View>
      <Pressable
        onPress={onSaveTemplate}
        disabled={saved}
        accessibilityRole="button"
        accessibilityLabel={saved ? `${addOn.label} is saved` : `Save ${addOn.label} for reuse`}
        style={styles.save}>
        <MaterialIcons name={saved ? 'bookmark' : 'bookmark-border'} size={22} color={colors.accentMuted} />
      </Pressable>
      <Pressable onPress={onRemove} accessibilityLabel={`Remove ${addOn.label}`} style={styles.remove}>
        <AppText size={18} color={colors.dangerText}>
          ✕
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.parentBorder,
    borderStyle: 'dashed',
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.parentGround,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, minWidth: 0, gap: 6 },
  label: { lineHeight: 21 },
  save: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.parentGround,
    alignItems: 'center',
    justifyContent: 'center',
  },
  remove: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.dangerBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
