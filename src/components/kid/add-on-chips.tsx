import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Emoji } from '@/components/emoji';
import { addOnExtra } from '@/domain/format';
import type { AddOn } from '@/domain/types';
import { colors, sticker } from '@/theme/tokens';

import { StickerPressable } from './sticker-pressable';

type Props = { addOns: AddOn[]; onPick: (addOnId: string) => void };

/** "Something came up?" row on the checklist: tapping an add-on adds its time and starts its timer. */
export function AddOnChips({ addOns, onPick }: Props) {
  if (addOns.length === 0) return null;
  return (
    <View style={styles.section}>
      <AppText size={15} color={colors.secondary}>
        Something came up?
      </AppText>
      <View style={styles.chips}>
        {addOns.map((a) => (
          <StickerPressable
            key={a.id}
            onPress={() => onPick(a.id)}
            shadow={sticker.shadow.small}
            radius={99}
            accessibilityLabel={`${a.label}, ${addOnExtra(a.mins)}`}
            style={styles.chip}
            faceStyle={styles.face}>
            <Emoji size={22}>{a.emoji}</Emoji>
            <AppText size={17} weight="semibold" numberOfLines={1} style={styles.label}>
              {a.label}
            </AppText>
            <AppText size={14} color={colors.muted} tabular>
              {addOnExtra(a.mins)}
            </AppText>
          </StickerPressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { height: 46 + sticker.shadow.small, maxWidth: '100%' },
  face: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
  },
  label: { flexShrink: 1 },
});
