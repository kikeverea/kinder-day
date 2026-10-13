import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { colors } from '@/theme/tokens';

type Props = { kidName: string; onKidMode: () => void; onSettings: () => void };

/** "Grown-ups / {name}'s day" with ⚙️ settings and the 🔓 Kid mode button. */
export function ParentHeader({ kidName, onKidMode, onSettings }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.titles}>
        <AppText size={15} color={colors.muted}>
          Grown-ups
        </AppText>
        <AppText size={32} weight="bold" numberOfLines={1} style={styles.title}>
          {kidName}&apos;s day
        </AppText>
      </View>
      <Pressable
        onPress={onSettings}
        accessibilityLabel="Settings"
        hitSlop={6}
        style={({ pressed }) => [styles.settings, pressed && styles.pressed]}>
        <MaterialIcons name="settings" size={24} color={colors.accentMuted} />
      </Pressable>
      <Pressable
        onPress={onKidMode}
        accessibilityRole="button"
        style={({ pressed }) => [styles.kidMode, pressed && styles.pressed]}>
        <AppText size={16} weight="semibold">
          🔓 Kid mode
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  titles: { flex: 1 },
  title: { lineHeight: 36 },
  kidMode: {
    height: 46,
    paddingHorizontal: 16,
    borderRadius: 99,
    borderWidth: 2.5,
    borderColor: colors.ink,
    backgroundColor: colors.lock,
    justifyContent: 'center',
  },
  settings: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: colors.parentBorder,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { transform: [{ translateY: 2 }] },
});
