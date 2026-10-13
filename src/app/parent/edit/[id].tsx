import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { usePreventRemove } from 'expo-router/react-navigation';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Pressable, StyleSheet, TextInput, View } from 'react-native';
import {
  NestedReorderableList,
  ScrollViewContainer,
  type ReorderableListReorderEvent,
} from 'react-native-reorderable-list';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/app-text';
import { Emoji } from '@/components/emoji';
import { AddStepBox } from '@/components/parent/add-step-box';
import { ColorPicker } from '@/components/parent/color-picker';
import { DayPicker } from '@/components/parent/day-picker';
import { IconGrid } from '@/components/parent/icon-grid';
import { StepEditorRow } from '@/components/parent/step-editor-row';
import {
  addStep,
  canSave,
  draftFromRoutine,
  moveStep,
  newDraft,
  removeStep,
  toggleDay,
  toggleEveryDay,
  toggleMode,
  toRoutine,
  updateStep,
  type RoutineDraft,
} from '@/domain/draft';
import { stepsTotalLabel } from '@/domain/format';
import { useAppStore } from '@/store';
import { colors, fonts, parentCard, spacing } from '@/theme/tokens';

export default function RoutineEditor() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const saveRoutine = useAppStore((s) => s.saveRoutine);
  const deleteRoutine = useAppStore((s) => s.deleteRoutine);
  const [draft, setDraft] = useState<RoutineDraft>(() => {
    const { routines } = useAppStore.getState();
    const existing = routines.find((r) => r.id === id);
    return existing ? draftFromRoutine(existing) : newDraft(routines.length);
  });
  const patch = (p: Partial<RoutineDraft>) => setDraft((d) => ({ ...d, ...p }));
  const savable = canSave(draft);

  // Ask before discarding edits (back button, Android back, swipe). Save/Delete leave freely.
  const navigation = useNavigation();
  const [initial] = useState(() => JSON.stringify(draft));
  const [leaving, setLeaving] = useState(false);
  const dirty = JSON.stringify(draft) !== initial;
  usePreventRemove(dirty && !leaving, ({ data }) =>
    Alert.alert('Discard changes?', 'Your changes to this routine will be lost.', [
      { text: 'Keep editing', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: () => navigation.dispatch(data.action) },
    ]),
  );
  useEffect(() => {
    if (leaving) router.back();
  }, [leaving]);

  const save = () => {
    if (!savable) return;
    saveRoutine(toRoutine(draft));
    setLeaving(true);
  };

  const confirmDelete = () =>
    Alert.alert(`Delete ${draft.name.trim() || 'this routine'}?`, "This can't be undone.", [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteRoutine(draft.id);
          setLeaving(true);
        },
      },
    ]);

  const onReorder = ({ from, to }: ReorderableListReorderEvent) =>
    setDraft((d) => moveStep(d, from, to));

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView behavior="padding" style={styles.screen}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} accessibilityLabel="Back" style={styles.back}>
            <AppText size={26} weight="semibold" style={styles.backGlyph}>
              ‹
            </AppText>
          </Pressable>
          <AppText size={26} weight="bold" style={styles.title}>
            {draft.isNew ? 'New routine' : 'Edit routine'}
          </AppText>
          {!draft.isNew ? (
            <Pressable onPress={confirmDelete} accessibilityRole="button" style={styles.delete}>
              <AppText size={15} color={colors.dangerText}>
                Delete
              </AppText>
            </Pressable>
          ) : null}
        </View>

        <ScrollViewContainer
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled">
          <View style={styles.identity}>
            <View style={[styles.preview, { backgroundColor: draft.color }]}>
              <Emoji size={46}>{draft.emoji}</Emoji>
            </View>
            <View style={styles.nameField}>
              <AppText size={15} color={colors.muted}>
                Routine name
              </AppText>
              <TextInput
                value={draft.name}
                onChangeText={(name) => patch({ name })}
                placeholder="e.g. After school"
                placeholderTextColor={colors.softLabel}
                style={styles.nameInput}
              />
            </View>
          </View>

          <DayPicker
            days={draft.days}
            onToggleDay={(day) => setDraft((d) => toggleDay(d, day))}
            onToggleEveryDay={() => setDraft(toggleEveryDay)}
          />

          <View style={styles.section}>
            <AppText size={17} weight="semibold">
              Color
            </AppText>
            <ColorPicker value={draft.color} onChange={(color) => patch({ color })} />
          </View>

          <View style={styles.section}>
            <AppText size={17} weight="semibold">
              Icon
            </AppText>
            <View style={styles.iconBox}>
              <IconGrid value={draft.emoji} onChange={(emoji) => patch({ emoji })} />
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.stepsHeader}>
              <AppText size={17} weight="semibold">
                Steps
              </AppText>
              <AppText size={14} color={colors.muted}>
                {stepsTotalLabel(draft)}
              </AppText>
            </View>
            {draft.steps.length > 1 ? (
              <AppText size={13} color={colors.muted}>
                Drag ⠿ to reorder
              </AppText>
            ) : null}
            {/* The page scrolls, not the list (drag autoscroll uses the outer container).
                scrollEnabled={false} also tells RN this nested VirtualizedList is intentional. */}
            <NestedReorderableList
              scrollEnabled={false}
              data={draft.steps}
              keyExtractor={(s) => s.id}
              onReorder={onReorder}
              renderItem={({ item, index }) => (
                <StepEditorRow
                  step={item}
                  index={index}
                  onToggleMode={() => setDraft((d) => updateStep(d, item.id, { mode: toggleMode(item.mode) }))}
                  onMins={(mins) => setDraft((d) => updateStep(d, item.id, { mins }))}
                  onRemove={() => setDraft((d) => removeStep(d, item.id))}
                />
              )}
            />
            <AddStepBox onAdd={(step) => setDraft((d) => addStep(d, step))} />
          </View>
        </ScrollViewContainer>

        <View style={styles.footer}>
          <Pressable
            onPress={save}
            disabled={!savable}
            accessibilityRole="button"
            style={({ pressed }) => [styles.save, !savable && styles.disabled, pressed && styles.pressed]}>
            <AppText size={22} weight="semibold" color={colors.white}>
              {draft.isNew ? 'Create routine' : 'Save changes'}
            </AppText>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.parentGround },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: spacing.screenX,
    paddingTop: 12,
  },
  back: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2.5,
    borderColor: colors.ink,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backGlyph: { lineHeight: 30, marginTop: -4 },
  title: { flex: 1 },
  delete: {
    height: 42,
    paddingHorizontal: 14,
    borderRadius: 99,
    borderWidth: 2,
    borderColor: colors.dangerBorder,
    backgroundColor: colors.white,
    justifyContent: 'center',
  },
  content: { paddingHorizontal: spacing.screenX, paddingTop: 20, paddingBottom: 24, gap: 24 },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  preview: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 3,
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameField: { flex: 1, gap: 6 },
  nameInput: {
    height: 52,
    borderWidth: 2.5,
    borderColor: colors.ink,
    borderRadius: 16,
    paddingHorizontal: 14,
    fontFamily: fonts.medium,
    fontSize: 20,
    color: colors.ink,
    backgroundColor: colors.white,
  },
  section: { gap: 10 },
  iconBox: {
    backgroundColor: colors.white,
    borderWidth: parentCard.border,
    borderColor: colors.parentBorder,
    borderRadius: parentCard.radius,
    padding: 10,
  },
  stepsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  footer: { paddingHorizontal: spacing.screenX, paddingTop: 12, paddingBottom: 18 },
  save: {
    height: 60,
    borderRadius: 20,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: { opacity: 0.4 },
  pressed: { transform: [{ translateY: 2 }] },
});
