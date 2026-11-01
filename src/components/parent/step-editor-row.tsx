import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { useReorderableDrag } from 'react-native-reorderable-list';

import { AppText } from '@/components/app-text';
import { Emoji } from '@/components/emoji';
import { MAX_BUFFER_MINS, MIN_BUFFER_MINS } from '@/domain/constants';
import type { Step } from '@/domain/types';
import { colors } from '@/theme/tokens';

import { MinutesStepper } from './minutes-stepper';
import { ModeChip } from './mode-chip';

type Props = {
  step: Step;
  index: number;
  onToggleMode: () => void;
  onMins: (mins: number) => void;
  onBuffer: (patch: Partial<Pick<Step, 'beforeMins' | 'afterMins'>>) => void;
  onRemove: () => void;
};

/**
 * Editor step: drag handle, number, icon, label, mode chip, minutes and remove. Exact steps add
 * "Before" and "After" buffer minutes above and below their own. Must render inside a reorderable list.
 */
export function StepEditorRow({ step, index, onToggleMode, onMins, onBuffer, onRemove }: Props) {
  const exact = step.mode === 'exact';
  const drag = useReorderableDrag();

  return (
    <View style={styles.row}>
      <Pressable onPressIn={drag} accessibilityLabel="Drag to reorder" hitSlop={8} style={styles.handle}>
        <MaterialIcons name="drag-indicator" size={24} color={colors.softLabel} />
      </Pressable>
      <AppText size={15} weight="semibold" color={colors.softLabel} style={styles.number}>
        {index + 1}
      </AppText>
      <View style={styles.icon}>
        <Emoji size={26}>{step.emoji}</Emoji>
      </View>
      <View style={styles.body}>
        <AppText size={18} style={styles.label}>
          {step.label}
        </AppText>
        {exact ? (
          <MinutesStepper
            label="Before"
            mins={step.beforeMins}
            min={MIN_BUFFER_MINS}
            max={MAX_BUFFER_MINS}
            onChange={(beforeMins) => onBuffer({ beforeMins })}
          />
        ) : null}
        <View style={styles.controls}>
          <ModeChip mode={step.mode} onPress={onToggleMode} />
          <MinutesStepper mins={step.mins} onChange={onMins} />
        </View>
        {exact ? (
          <MinutesStepper
            label="After"
            mins={step.afterMins}
            min={MIN_BUFFER_MINS}
            max={MAX_BUFFER_MINS}
            onChange={(afterMins) => onBuffer({ afterMins })}
          />
        ) : null}
      </View>
      <Pressable onPress={onRemove} accessibilityLabel={`Remove ${step.label}`} style={styles.remove}>
        <AppText size={18} color={colors.dangerText}>
          ✕
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.parentBorder,
    borderRadius: 18,
    paddingVertical: 8,
    paddingLeft: 4,
    paddingRight: 8,
    marginBottom: 10,
  },
  handle: { width: 28, height: 44, alignItems: 'center', justifyContent: 'center' },
  number: { width: 18, textAlign: 'center' },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.parentGround,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, minWidth: 0, gap: 6 },
  label: { lineHeight: 21 },
  controls: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 },
  remove: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.dangerBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
