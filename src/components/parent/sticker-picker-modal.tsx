import { ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { STICKER_GROUPS } from '@/domain/constants';
import type { RoutineResult } from '@/domain/types';
import { colors } from '@/theme/tokens';

import { IconGrid } from './icon-grid';
import { PickerLink, PickerModal } from './picker-modal';

type Props = {
  /** Routine whose result gets the sticker; null hides the modal. */
  target: { name: string; emoji: string; result: RoutineResult } | null;
  onPick: (sticker: string | null) => void;
  onClose: () => void;
};

/** Grown-ups give today's result a reward sticker, picked from `STICKER_GROUPS`. */
export function StickerPickerModal({ target, onPick, onClose }: Props) {
  const current = target?.result.sticker ?? '';

  return (
    <PickerModal
      visible={!!target}
      emoji={target?.emoji ?? ''}
      name={target?.name ?? ''}
      prompt="Give a sticker"
      onClose={onClose}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.groups}>
        {STICKER_GROUPS.map((group) => (
          <View key={group.title} style={styles.group}>
            <AppText size={14} weight="semibold" color={colors.softLabel}>
              {group.title}
            </AppText>
            <IconGrid value={current} icons={group.stickers} emojiSize={26} onChange={onPick} />
          </View>
        ))}
      </ScrollView>
      {current ? <PickerLink label={`Remove sticker (${current})`} onPress={() => onPick(null)} /> : null}
    </PickerModal>
  );
}

const styles = StyleSheet.create({
  scroll: { flexShrink: 1, marginTop: 4 },
  groups: { gap: 16, paddingBottom: 4 },
  group: { gap: 8 },
});
