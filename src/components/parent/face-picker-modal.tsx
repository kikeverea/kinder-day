import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Emoji } from '@/components/emoji';
import { FACE_CHOICES, FACE_EMOJI } from '@/domain/constants';
import type { ResultFace, RoutineResult } from '@/domain/types';
import { colors } from '@/theme/tokens';

type Props = {
  /** Routine whose result is being changed; null hides the modal. */
  target: { name: string; emoji: string; result: RoutineResult } | null;
  onPick: (face: ResultFace | null) => void;
  onClose: () => void;
};

/** Grown-ups pick the face shown for today's result: 😡 😬 😶 😄 🦄. */
export function FacePickerModal({ target, onPick, onClose }: Props) {
  const result = target?.result;
  const current = result ? (result.faceOverride ?? result.rating) : undefined;

  return (
    <Modal visible={!!target} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close">
        {/* Swallow taps on the sheet so they don't close it. */}
        <Pressable style={styles.sheet} onPress={() => {}}>
          {target && result ? (
            <>
              <AppText size={22} weight="semibold" align="center">
                {target.emoji} {target.name}
              </AppText>
              <AppText size={15} color={colors.muted} align="center">
                How did it go?
              </AppText>
              <View style={styles.faces}>
                {FACE_CHOICES.map((face) => {
                  const on = face === current;
                  return (
                    <Pressable
                      key={face}
                      onPress={() => onPick(face === result.rating ? null : face)}
                      accessibilityLabel={face}
                      accessibilityState={{ selected: on }}
                      style={({ pressed }) => [
                        styles.face,
                        on && styles.selected,
                        pressed && styles.pressed,
                      ]}>
                      <Emoji size={34}>{FACE_EMOJI[face]}</Emoji>
                    </Pressable>
                  );
                })}
              </View>
              {result.faceOverride ? (
                <Pressable onPress={() => onPick(null)} hitSlop={8} accessibilityRole="button">
                  <AppText size={14} color={colors.muted} align="center" style={styles.link}>
                    Use automatic ({FACE_EMOJI[result.rating]})
                  </AppText>
                </Pressable>
              ) : null}
            </>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(43, 35, 64, 0.45)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  sheet: {
    backgroundColor: colors.white,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.parentBorder,
    paddingVertical: 22,
    paddingHorizontal: 16,
    gap: 10,
  },
  faces: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, gap: 6 },
  face: {
    flex: 1,
    aspectRatio: 1,
    maxWidth: 62,
    borderRadius: 18,
    borderWidth: 2.5,
    borderColor: 'transparent',
    backgroundColor: colors.parentGround,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selected: { borderColor: colors.ink, backgroundColor: colors.pressedTintSoft },
  pressed: { backgroundColor: colors.pressedTint },
  link: { textDecorationLine: 'underline', marginTop: 4 },
});
