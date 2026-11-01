import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Emoji } from '@/components/emoji';
import { ADD_ON_ICONS } from '@/domain/constants';
import { clampMins, EMPTY_NEW_ADD_ON, type NewAddOn } from '@/domain/draft';
import { colors, fonts } from '@/theme/tokens';

import { IconGrid } from './icon-grid';
import { MinutesStepper } from './minutes-stepper';

/** "Add an add-on…" box: icon picker, label and minutes. Resets after adding. */
export function AddAddOnBox({ onAdd }: { onAdd: (addOn: NewAddOn) => void }) {
  const [addOn, setAddOn] = useState<NewAddOn>(EMPTY_NEW_ADD_ON);
  const [picking, setPicking] = useState(false);
  const canAdd = addOn.label.trim().length > 0;

  const add = () => {
    if (!canAdd) return;
    onAdd(addOn);
    setAddOn(EMPTY_NEW_ADD_ON);
    setPicking(false);
  };

  return (
    <View style={styles.box}>
      <View style={styles.row}>
        <Pressable
          onPress={() => setPicking((p) => !p)}
          accessibilityLabel="Pick add-on icon"
          style={styles.iconButton}>
          <Emoji size={28}>{addOn.emoji}</Emoji>
        </Pressable>
        <TextInput
          value={addOn.label}
          onChangeText={(label) => setAddOn((a) => ({ ...a, label }))}
          onSubmitEditing={add}
          submitBehavior="submit"
          returnKeyType="done"
          placeholder="Add an add-on…"
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
        <MinutesStepper
          mins={addOn.mins}
          onChange={(mins) => setAddOn((a) => ({ ...a, mins: clampMins(mins) }))}
          large
        />
      </View>
      {picking ? (
        <View style={styles.picker}>
          <IconGrid
            value={addOn.emoji}
            icons={ADD_ON_ICONS}
            emojiSize={24}
            onChange={(emoji) => {
              setAddOn((a) => ({ ...a, emoji }));
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
    borderStyle: 'dashed',
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
  settings: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 4 },
  picker: { borderTopWidth: 2, borderTopColor: colors.pressedTint, paddingTop: 10 },
});
