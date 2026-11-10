import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { DEFAULT_STEP_MINS } from '@/domain/constants';
import type { Step } from '@/domain/types';
import { colors } from '@/theme/tokens';

import { MinutesStepper } from './minutes-stepper';
import { PickerModal } from './picker-modal';

type Props = {
  /** Step with no time going into a timed routine; null hides the modal. */
  step: Pick<Step, 'emoji' | 'label'> | null;
  /** "Add" for a saved step being added, "Set" for a step already in the routine. */
  confirmLabel: string;
  onConfirm: (mins: number) => void;
  onClose: () => void;
};

/** Asks for a time when a step with no time joins a timed routine, so it never runs with 0 min. */
export function StepTimeModal({ step, confirmLabel, onConfirm, onClose }: Props) {
  return (
    <PickerModal
      visible={!!step}
      emoji={step?.emoji ?? ''}
      name={step?.label ?? ''}
      prompt="This step has no time yet. How long can it take?"
      onClose={onClose}>
      {/* Remount per step so each prompt starts from the default time. */}
      {step ? (
        <TimeForm key={step.label} confirmLabel={confirmLabel} onConfirm={onConfirm} onClose={onClose} />
      ) : null}
    </PickerModal>
  );
}

function TimeForm({ confirmLabel, onConfirm, onClose }: Omit<Props, 'step'>) {
  const [mins, setMins] = useState(DEFAULT_STEP_MINS);
  return (
    <>
      <View style={styles.stepper}>
        <MinutesStepper mins={mins} onChange={setMins} large />
      </View>
      <View style={styles.buttons}>
        <Pressable onPress={onClose} accessibilityRole="button" style={[styles.button, styles.cancel]}>
          <AppText size={17} weight="semibold">
            Cancel
          </AppText>
        </Pressable>
        <Pressable
          onPress={() => onConfirm(mins)}
          accessibilityRole="button"
          style={[styles.button, styles.confirm]}>
          <AppText size={17} weight="semibold" color={colors.white}>
            {confirmLabel}
          </AppText>
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  stepper: { alignItems: 'center', marginVertical: 8 },
  buttons: { flexDirection: 'row', gap: 10 },
  button: { flex: 1, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  cancel: { backgroundColor: colors.parentGround, borderWidth: 2, borderColor: colors.parentBorder },
  confirm: { backgroundColor: colors.ink },
});
