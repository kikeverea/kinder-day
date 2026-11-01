import { Pressable, StyleSheet, View } from 'react-native';

import { Emoji } from '@/components/emoji';
import { FACE_CHOICES, FACE_EMOJI } from '@/domain/constants';
import type { ResultFace, RoutineResult } from '@/domain/types';
import { colors } from '@/theme/tokens';

import { PickerLink, PickerModal } from './picker-modal';

type Props = {
  /** Routine whose result is being changed; null hides the modal. */
  target: { name: string; emoji: string; result: RoutineResult } | null;
  onPick: (face: ResultFace | null) => void;
  onClose: () => void;
};

/** Grown-ups pick the face shown for today's result: 😡 😬 😶 😄. */
export function FacePickerModal({ target, onPick, onClose }: Props) {
  const result = target?.result;
  const current = result ? (result.faceOverride ?? result.rating) : undefined;

  return (
    <PickerModal
      visible={!!target}
      emoji={target?.emoji ?? ''}
      name={target?.name ?? ''}
      prompt="How did it go?"
      onClose={onClose}>
      {result ? (
        <>
          <View style={styles.faces}>
            {FACE_CHOICES.map((face) => {
              const on = face === current;
              return (
                <Pressable
                  key={face}
                  onPress={() => onPick(face === result.rating ? null : face)}
                  accessibilityLabel={face}
                  accessibilityState={{ selected: on }}
                  style={({ pressed }) => [styles.face, on && styles.selected, pressed && styles.pressed]}>
                  <Emoji size={34}>{FACE_EMOJI[face]}</Emoji>
                </Pressable>
              );
            })}
          </View>
          {result.faceOverride ? (
            <PickerLink label={`Use automatic (${FACE_EMOJI[result.rating]})`} onPress={() => onPick(null)} />
          ) : null}
        </>
      ) : null}
    </PickerModal>
  );
}

const styles = StyleSheet.create({
  faces: { flexDirection: 'row', justifyContent: 'center', marginTop: 8, gap: 10 },
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
});
