import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/app-text';
import { useAppStore } from '@/store';
import { colors } from '@/theme/tokens';

// Phase 2 placeholder so the lock flow can be tried end to end. Replaced by the parent area in phase 3.
export default function ParentHome() {
  const kidName = useAppStore((s) => s.settings.kidName);
  const lockParent = useAppStore((s) => s.lockParent);

  const toKidMode = () => {
    router.dismissTo('/');
    lockParent();
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <View>
          <AppText size={15} color={colors.muted}>
            Grown-ups
          </AppText>
          <AppText size={32} weight="bold">
            {kidName}&apos;s day
          </AppText>
        </View>
        <Pressable onPress={toKidMode} style={styles.kidMode} accessibilityRole="button">
          <AppText size={17} weight="semibold">
            🔓 Kid mode
          </AppText>
        </Pressable>
      </View>
      <AppText size={17} color={colors.muted} style={styles.soon}>
        The grown-ups area arrives in the next phase.
      </AppText>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.parentGround, paddingHorizontal: 20, paddingTop: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  kidMode: {
    backgroundColor: colors.lock,
    borderWidth: 2.5,
    borderColor: colors.ink,
    borderRadius: 99,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  soon: { marginTop: 40, textAlign: 'center' },
});
