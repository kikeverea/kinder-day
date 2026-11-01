import { MaterialIcons } from '@expo/vector-icons';
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
  /** Adds a ✕ button in the top-right corner, for sheets too big for tap-outside to be obvious. */
  closeButton?: boolean;
  children: ReactNode;
};

/** Centered sheet over a dimmed backdrop (tap outside to close), shared by the result pickers. */
export function PickerModal({ visible, emoji, name, prompt, onClose, closeButton, children }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.backdrop}>
        {/* A sibling behind the sheet, not its parent: a pressable around the sheet would take the
            touch responder and stop the sticker list from scrolling when a drag starts off an icon. */}
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close" />
        <View style={styles.sheet}>
          <AppText size={22} weight="semibold" align="center" style={closeButton && styles.clearClose}>
            {emoji} {name}
          </AppText>
          <AppText size={15} color={colors.muted} align="center">
            {prompt}
          </AppText>
          {children}
          {closeButton ? (
            <Pressable
              onPress={onClose}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Close"
              style={({ pressed }) => [styles.close, pressed && styles.closePressed]}>
              <MaterialIcons name="close" size={24} color={colors.accentMuted} />
            </Pressable>
          ) : null}
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
  // Keeps a long title clear of the ✕.
  clearClose: { paddingHorizontal: 40 },
  close: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.parentGround,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closePressed: { backgroundColor: colors.pressedTint },
  link: { textDecorationLine: 'underline', marginTop: 4 },
});
