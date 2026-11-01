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
};

/** Editor add-on: icon, label, minutes and remove. Add-ons only have a time (no mode, no buffers). */
export function AddOnEditorRow({ addOn, onMins, onRemove }: Props) {
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
  remove: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.dangerBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
