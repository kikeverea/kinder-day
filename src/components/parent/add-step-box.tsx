import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Emoji } from '@/components/emoji';
import { STEP_MODES } from '@/domain/constants';
import { clampMins, EMPTY_NEW_STEP, toggleMode, type NewStep } from '@/domain/draft';
import { colors, fonts } from '@/theme/tokens';

import { IconGrid } from './icon-grid';
import { MinutesStepper } from './minutes-stepper';
import { ModeChip } from './mode-chip';

/** "Add a step…" box: icon picker, label, mode and minutes. Resets after adding. */
export function AddStepBox({ onAdd }: { onAdd: (step: NewStep) => void }) {
  const [step, setStep] = useState<NewStep>(EMPTY_NEW_STEP);
  const [picking, setPicking] = useState(false);
  const canAdd = step.label.trim().length > 0;

  const add = () => {
    if (!canAdd) return;
    onAdd(step);
    setStep(EMPTY_NEW_STEP);
    setPicking(false);
  };

  return (
    <View style={styles.box}>
      <View style={styles.row}>
        <Pressable
          onPress={() => setPicking((p) => !p)}
          accessibilityLabel="Pick step icon"
          style={styles.iconButton}>
          <Emoji size={28}>{step.emoji}</Emoji>
        </Pressable>
        <TextInput
          value={step.label}
          onChangeText={(label) => setStep((s) => ({ ...s, label }))}
          onSubmitEditing={add}
          submitBehavior="submit"
          returnKeyType="done"
          placeholder="Add a step…"
          placeholderTextColor={colors.softLabel}
          style={styles.input}
        />
        <Pressable
          onPress={add}
          disabled={!canAdd}
          accessibilityRole="button"
          style={[styles.add, !canAdd && styles.disabled]}>
          <AppText size={17} weight="semibold" color={colors.white}>
            Add
          </AppText>
        </Pressable>
      </View>
      <View style={styles.settings}>
        <ModeChip mode={step.mode} onPress={() => setStep((s) => ({ ...s, mode: toggleMode(s.mode) }))} large />
        <View style={styles.spacer} />
        <MinutesStepper
          mins={step.mins}
          onChange={(mins) => setStep((s) => ({ ...s, mins: clampMins(mins) }))}
          large
        />
      </View>
      <AppText size={13} color={colors.muted} style={styles.hint}>
        {STEP_MODES[step.mode].hint}
      </AppText>
      {picking ? (
        <View style={styles.picker}>
          <IconGrid
            value={step.emoji}
            emojiSize={24}
            onChange={(emoji) => {
              setStep((s) => ({ ...s, emoji }));
              setPicking(false);
            }}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    gap: 10,
    backgroundColor: colors.white,
    borderWidth: 2.5,
    borderColor: colors.ink,
    borderRadius: 18,
    padding: 10,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconButton: {
    width: 52,
    height: 52,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.parentBorder,
    backgroundColor: colors.parentGround,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    minWidth: 0,
    height: 52,
    fontFamily: fonts.medium,
    fontSize: 19,
    color: colors.ink,
  },
  add: {
    height: 48,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: colors.ink,
    justifyContent: 'center',
  },
  disabled: { opacity: 0.4 },
  settings: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 4 },
  spacer: { flex: 1 },
  hint: { paddingHorizontal: 4, lineHeight: 17 },
  picker: { borderTopWidth: 2, borderTopColor: colors.pressedTint, paddingTop: 10 },
});
