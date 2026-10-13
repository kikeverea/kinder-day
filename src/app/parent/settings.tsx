import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/app-text';
import { Card } from '@/components/parent/card';
import { MAX_GRACE_MINS } from '@/domain/constants';
import { useAppStore } from '@/store';
import { colors, fonts, spacing } from '@/theme/tokens';

/** Grown-ups settings. Changes apply immediately. */
export default function Settings() {
  const settings = useAppStore((s) => s.settings);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const [name, setName] = useState(settings.kidName);

  const onName = (text: string) => {
    setName(text);
    // An empty name would read "Good morning, !" — keep the last non-empty one.
    if (text.trim()) updateSettings({ kidName: text.trim() });
  };

  const grace = settings.graceMins;

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} accessibilityLabel="Back" style={styles.back}>
          <AppText size={26} weight="semibold" style={styles.backGlyph}>
            ‹
          </AppText>
        </Pressable>
        <AppText size={26} weight="bold">
          Settings
        </AppText>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.section}>
          <AppText size={17} weight="semibold">
            Kid&apos;s name
          </AppText>
          <TextInput
            value={name}
            onChangeText={onName}
            onBlur={() => setName(settings.kidName)}
            placeholder="Name"
            placeholderTextColor={colors.softLabel}
            style={styles.input}
          />
        </View>

        <View style={styles.section}>
          <AppText size={17} weight="semibold">
            Almost on time 😶
          </AppText>
          <Card style={styles.graceCard}>
            <AppText size={15} color={colors.muted} style={styles.flex}>
              Up to {grace} min over still counts as almost on time. More than that is 😬.
            </AppText>
            <View style={styles.stepper}>
              <StepButton label="−" disabled={grace <= 0} onPress={() => updateSettings({ graceMins: grace - 1 })} />
              <AppText size={18} weight="semibold" tabular align="center" style={styles.graceValue}>
                {grace} min
              </AppText>
              <StepButton
                label="+"
                disabled={grace >= MAX_GRACE_MINS}
                onPress={() => updateSettings({ graceMins: grace + 1 })}
              />
            </View>
          </Card>
        </View>

        <View style={styles.section}>
          <ToggleRow
            title="Chimes"
            detail="A chime and a buzz shortly before a step's time runs out, and two when it's up."
            value={settings.chimes}
            onChange={(chimes) => updateSettings({ chimes })}
          />
          <ToggleRow
            title="Confetti"
            detail="Celebrate routines done on time."
            value={settings.confetti}
            onChange={(confetti) => updateSettings({ confetti })}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StepButton({ label, disabled, onPress }: { label: string; disabled: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={label === '+' ? 'More minutes' : 'Fewer minutes'}
      style={[styles.stepButton, disabled && styles.disabled]}>
      <AppText size={20} weight="semibold">
        {label}
      </AppText>
    </Pressable>
  );
}

function ToggleRow({
  title,
  detail,
  value,
  onChange,
}: {
  title: string;
  detail: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <Card>
      <View style={styles.flex}>
        <AppText size={17} weight="semibold">
          {title}
        </AppText>
        <AppText size={14} color={colors.muted}>
          {detail}
        </AppText>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: colors.ink, false: colors.dashed }}
        thumbColor={colors.white}
        accessibilityLabel={title}
      />
    </Card>
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
  content: { paddingHorizontal: spacing.screenX, paddingTop: 20, paddingBottom: 32, gap: 24 },
  section: { gap: 10 },
  input: {
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
  graceCard: { flexDirection: 'column', alignItems: 'stretch', gap: 12 },
  flex: { flex: 1 },
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  stepButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.parentBorder,
    backgroundColor: colors.parentGround,
    alignItems: 'center',
    justifyContent: 'center',
  },
  graceValue: { minWidth: 70 },
  disabled: { opacity: 0.4 },
});
