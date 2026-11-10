import { router, useLocalSearchParams } from 'expo-router';
import { usePreventRemove } from 'expo-router/react-navigation';
import { useEffect, useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Pressable, StyleSheet, TextInput, View } from 'react-native';
import {
  NestedReorderableList,
  ScrollViewContainer,
  type ReorderableListReorderEvent,
} from 'react-native-reorderable-list';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/app-text';
import { Emoji } from '@/components/emoji';
import { AddAddOnBox } from '@/components/parent/add-add-on-box';
import { AddOnEditorRow } from '@/components/parent/add-on-editor-row';
import { AddStepBox } from '@/components/parent/add-step-box';
import { ColorPicker } from '@/components/parent/color-picker';
import { DayPicker } from '@/components/parent/day-picker';
import { IconGrid } from '@/components/parent/icon-grid';
import { SegmentedControl } from '@/components/parent/segmented-control';
import { StepEditorRow } from '@/components/parent/step-editor-row';
import { StepTimeModal } from '@/components/parent/step-time-modal';
import {
  addAddOn,
  addStep,
  canSave,
  draftFromRoutine,
  moveStep,
  needsTime,
  newDraft,
  removeAddOn,
  removeStep,
  setTimed,
  toggleDay,
  toggleEveryDay,
  toggleStepMode,
  toRoutine,
  updateAddOnMins,
  updateStep,
  type NewStep,
  type RoutineDraft,
} from '@/domain/draft';
import { ADD_ON_HINT, ROUTINE_TYPE_HINT, ROUTINE_TYPES } from '@/domain/constants';
import { plural, stepsTotalLabel } from '@/domain/format';
import { isSavedTemplate, isStepSaved } from '@/domain/templates';
import { useAppStore } from '@/store';
import { colors, fonts, parentCard, spacing } from '@/theme/tokens';

export default function RoutineEditor() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const saveRoutine = useAppStore((s) => s.saveRoutine);
  const deleteRoutine = useAppStore((s) => s.deleteRoutine);
  const stepTemplates = useAppStore((s) => s.stepTemplates);
  const saveStepTemplate = useAppStore((s) => s.saveStepTemplate);
  const deleteStepTemplate = useAppStore((s) => s.deleteStepTemplate);
  const addOnTemplates = useAppStore((s) => s.addOnTemplates);
  const saveAddOnTemplate = useAppStore((s) => s.saveAddOnTemplate);
  const deleteAddOnTemplate = useAppStore((s) => s.deleteAddOnTemplate);
  const [draft, setDraft] = useState<RoutineDraft>(() => {
    const { routines } = useAppStore.getState();
    const existing = routines.find((r) => r.id === id);
    return existing ? draftFromRoutine(existing) : newDraft(routines.length);
  });
  const patch = (p: Partial<RoutineDraft>) => setDraft((d) => ({ ...d, ...p }));
  const savable = canSave(draft);
  const untimedSteps = draft.steps.filter((s) => needsTime(s, draft.timed)).length;
  // A step with no time on its way into a timed routine: a saved step being added (no id) or a
  // step already in it (after switching to timed). The time prompt is open while set.
  const [timeFor, setTimeFor] = useState<{ step: NewStep; stepId?: string } | null>(null);
  // Rows read saved steps and the routine type; re-render them when either changes.
  const rowDeps = useMemo(() => ({ stepTemplates, timed: draft.timed }), [stepTemplates, draft.timed]);

  const addOrAskTime = (step: NewStep) => {
    if (needsTime(step, draft.timed)) setTimeFor({ step });
    else setDraft((d) => addStep(d, step));
  };

  const confirmTime = (mins: number) => {
    if (!timeFor) return;
    const { step, stepId } = timeFor;
    setDraft((d) => (stepId ? updateStep(d, stepId, { mins }) : addStep(d, { ...step, mins })));
    setTimeFor(null);
  };

  // Ask before discarding edits (back button, Android back, swipe). Save/Delete leave freely.
  const [initial] = useState(() => JSON.stringify(draft));
  const [leaving, setLeaving] = useState(false);
  const [discarding, setDiscarding] = useState(false);
  const dirty = JSON.stringify(draft) !== initial;
  // SDK 58: to let the blocked navigation through, turn prevention off, then call `repeat()`.
  usePreventRemove(dirty && !leaving && !discarding, ({ repeat }) =>
    Alert.alert('Discard changes?', 'Your changes to this routine will be lost.', [
      { text: 'Keep editing', style: 'cancel' },
      {
        text: 'Discard',
        style: 'destructive',
        onPress: () => {
          setDiscarding(true);
          repeat();
        },
      },
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
            <AppText size={17} weight="semibold">
              Timer
            </AppText>
            <SegmentedControl
              options={ROUTINE_TYPES}
              value={draft.timed ? 'timed' : 'untimed'}
              onChange={(type) => setDraft((d) => setTimed(d, type === 'timed'))}
            />
            <AppText size={13} color={colors.muted}>
              {ROUTINE_TYPE_HINT[draft.timed ? 'timed' : 'untimed']}
            </AppText>
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
              extraData={rowDeps}
              keyExtractor={(s) => s.id}
              onReorder={onReorder}
              renderItem={({ item, index }) => (
                <StepEditorRow
                  step={item}
                  index={index}
                  onToggleMode={() => setDraft((d) => toggleStepMode(d, item.id))}
                  onMins={(mins) => setDraft((d) => updateStep(d, item.id, { mins }))}
                  onBuffer={(patch) => setDraft((d) => updateStep(d, item.id, patch))}
                  onRemove={() => setDraft((d) => removeStep(d, item.id))}
                  timed={draft.timed}
                  onSetTime={() => setTimeFor({ step: item, stepId: item.id })}
                  saved={isStepSaved(stepTemplates, item, draft.timed)}
                  onSaveTemplate={() => saveStepTemplate(item, draft.timed)}
                />
              )}
            />
            <AddStepBox
              onAdd={addOrAskTime}
              templates={stepTemplates}
              onSaveTemplate={(step) => saveStepTemplate(step, draft.timed)}
              onDeleteTemplate={deleteStepTemplate}
              timed={draft.timed}
            />
          </View>

          {/* Add-ons add time to the routine's total, so routines without timer have none. */}
          {draft.timed ? (
            <View style={styles.section}>
              <AppText size={17} weight="semibold">
                Add-ons
              </AppText>
              <AppText size={13} color={colors.muted}>
                {ADD_ON_HINT}
              </AppText>
              {draft.addOns.map((addOn) => (
                <AddOnEditorRow
                  key={addOn.id}
                  addOn={addOn}
                  onMins={(mins) => setDraft((d) => updateAddOnMins(d, addOn.id, mins))}
                  onRemove={() => setDraft((d) => removeAddOn(d, addOn.id))}
                  saved={isSavedTemplate(addOnTemplates, addOn)}
                  onSaveTemplate={() => saveAddOnTemplate(addOn)}
                />
              ))}
              <AddAddOnBox
                onAdd={(addOn) => setDraft((d) => addAddOn(d, addOn))}
                templates={addOnTemplates}
                onSaveTemplate={saveAddOnTemplate}
                onDeleteTemplate={deleteAddOnTemplate}
              />
            </View>
          ) : null}
        </ScrollViewContainer>

        <View style={styles.footer}>
          {untimedSteps > 0 ? (
            <AppText size={14} color={colors.dangerText} align="center">
              {plural(untimedSteps, 'step')} still {untimedSteps === 1 ? 'needs' : 'need'} a time
            </AppText>
          ) : null}
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
      <StepTimeModal
        step={timeFor?.step ?? null}
        confirmLabel={timeFor?.stepId ? 'Set' : 'Add'}
        onConfirm={confirmTime}
        onClose={() => setTimeFor(null)}
      />
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
  footer: { gap: 8, paddingHorizontal: spacing.screenX, paddingTop: 12, paddingBottom: 18 },
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
