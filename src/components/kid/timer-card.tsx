import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Emoji } from '@/components/emoji';
import { formatClock } from '@/domain/format';
import type { TimerCard as TimerCardData } from '@/domain/timer';
import { colors, sticker } from '@/theme/tokens';

import { ProgressRing } from './progress-ring';

type Props = { card: TimerCardData; totalLeft: number; color: string };

/** Current step countdown + "All steps" total. Hidden in focus mode. */
export function TimerCard({ card, totalLeft, color }: Props) {
  const overtime = card.state === 'overtime';
  const label = card.state === 'waiting' ? `Tap to start: ${card.step.label}` : `Now: ${card.step.label}`;

  return (
    <View style={styles.card}>
      <ProgressRing
        size={62}
        border={3}
        inner={42}
        innerBorder={2.5}
        fraction={card.fraction}
        color={overtime ? colors.overtimeRing : color}>
        <Emoji size={overtime ? 26 : 24}>{overtime ? '😬' : card.step.emoji}</Emoji>
      </ProgressRing>
      <View style={styles.middle}>
        <AppText size={15} color={colors.muted} numberOfLines={1}>
          {label}
        </AppText>
        <AppText
          size={overtime ? 26 : 32}
          weight="bold"
          tabular
          color={overtime ? colors.overtimeText : colors.ink}
          style={styles.big}>
          {overtime ? "Time's up!" : formatClock(card.left)}
        </AppText>
      </View>
      <View style={styles.total}>
        <AppText size={13} color={colors.muted}>
          ⏱️ All steps
        </AppText>
        <AppText
          size={20}
          weight="semibold"
          tabular
          color={totalLeft >= 0 ? colors.ink : colors.overtimeText}>
          {totalLeft >= 0 ? formatClock(totalLeft) : `+${formatClock(totalLeft)}`}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.white,
    borderWidth: sticker.border,
    borderColor: colors.ink,
    borderRadius: sticker.radius.row,
    paddingVertical: 10,
    paddingHorizontal: 14,
    boxShadow: `0 ${sticker.shadow.small}px 0 ${colors.ink}`,
    marginTop: 8,
  },
  middle: { flex: 1, minWidth: 0, gap: 2 },
  big: { lineHeight: 34 },
  total: {
    alignItems: 'flex-end',
    gap: 2,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: colors.parentBorder,
    borderStyle: 'dashed',
  },
});
