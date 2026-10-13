import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Emoji } from '@/components/emoji';
import { colors, sticker } from '@/theme/tokens';

type Props = {
  label: string;
  isToday: boolean;
  canGoBack: boolean;
  onBack: () => void;
  onForward: () => void;
  /** Tap on the date pill while looking at a past day: jump back to today. */
  onToday: () => void;
};

/** Kid Home date pill with ‹ › to look back at earlier days. */
export function DaySwitcher({ label, isToday, canGoBack, onBack, onForward, onToday }: Props) {
  return (
    <View style={styles.row}>
      <Arrow icon="chevron-left" label="Previous day" disabled={!canGoBack} onPress={onBack} />
      <Pressable
        onPress={isToday ? undefined : onToday}
        accessibilityRole={isToday ? undefined : 'button'}
        accessibilityHint={isToday ? undefined : 'Back to today'}
        style={styles.pill}>
        <View style={styles.icon}>
          <Emoji size={18}>📅</Emoji>
        </View>
        <AppText size={17} numberOfLines={1} style={styles.label}>
          {label}
        </AppText>
      </Pressable>
      <Arrow icon="chevron-right" label="Next day" disabled={isToday} onPress={onForward} />
    </View>
  );
}

function Arrow({
  icon,
  label,
  disabled,
  onPress,
}: {
  icon: 'chevron-left' | 'chevron-right';
  label: string;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={label}
      hitSlop={6}
      style={({ pressed }) => [styles.arrow, disabled && styles.disabled, pressed && styles.pressed]}>
      <MaterialIcons name={icon} size={26} color={colors.ink} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.white,
    borderWidth: sticker.border,
    borderColor: colors.ink,
    borderRadius: 99,
    paddingVertical: 6,
    paddingLeft: 8,
    paddingRight: 16,
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.lock,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { flex: 1 },
  arrow: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: sticker.border,
    borderColor: colors.ink,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: { opacity: 0.25 },
  pressed: { backgroundColor: colors.pressedTint },
});
