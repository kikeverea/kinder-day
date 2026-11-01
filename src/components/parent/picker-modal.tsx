import type { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { colors } from '@/theme/tokens';

type Props = {
  visible: boolean;
  /** Routine the pick is for, shown as the title. */
  emoji: string;
  name: string;
  prompt: string;
  onClose: () => void;
  children: ReactNode;
};

/** Centered sheet over a dimmed backdrop (tap outside to close), shared by the result pickers. */
export function PickerModal({ visible, emoji, name, prompt, onClose, children }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.backdrop}>
        {/* A sibling behind the sheet, not its parent: a pressable around the sheet would take the
            touch responder and stop the sticker list from scrolling when a drag starts off an icon. */}
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close" />
        <View style={styles.sheet}>
          <AppText size={22} weight="semibold" align="center">
            {emoji} {name}
          </AppText>
          <AppText size={15} color={colors.muted} align="center">
            {prompt}
          </AppText>
          {children}
        </View>
      </View>
    </Modal>
  );
}

/** Underlined text button under a picker, e.g. "Use automatic". */
export function PickerLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={8} accessibilityRole="button">
      <AppText size={14} color={colors.muted} align="center" style={styles.link}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(43, 35, 64, 0.45)',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 48,
  },
  sheet: {
    flexShrink: 1,
    backgroundColor: colors.white,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.parentBorder,
    paddingVertical: 22,
    paddingHorizontal: 16,
    gap: 10,
  },
  link: { textDecorationLine: 'underline', marginTop: 4 },
});
