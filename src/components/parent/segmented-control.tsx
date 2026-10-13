import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { colors } from '@/theme/tokens';

type Props<K extends string> = {
  options: readonly { key: K; label: string }[];
  value: K;
  onChange: (key: K) => void;
};

export function SegmentedControl<K extends string>({ options, value, onChange }: Props<K>) {
  return (
    <View style={styles.track} accessibilityRole="tablist">
      {options.map((o) => {
        const on = o.key === value;
        return (
          <Pressable
            key={o.key}
            onPress={() => onChange(o.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            style={[styles.tab, on && styles.active]}>
            <AppText size={16} weight={on ? 'semibold' : 'medium'}>
              {o.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    gap: 4,
    padding: 4,
    borderRadius: 99,
    backgroundColor: colors.segmentedTrack,
  },
  tab: { flex: 1, height: 42, borderRadius: 99, alignItems: 'center', justifyContent: 'center' },
  active: { backgroundColor: colors.white, boxShadow: '0 1px 3px rgba(43, 35, 64, 0.15)' },
});
