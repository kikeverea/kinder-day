import { Pressable, StyleSheet, View } from 'react-native';

import { ROUTINE_COLORS } from '@/domain/constants';
import { colors } from '@/theme/tokens';

export function ColorPicker({ value, onChange }: { value: string; onChange: (hex: string) => void }) {
  return (
    <View style={styles.row}>
      {ROUTINE_COLORS.map((hex) => {
        const on = hex === value;
        return (
          <Pressable
            key={hex}
            onPress={() => onChange(hex)}
            accessibilityLabel="Color"
            accessibilityState={{ selected: on }}
            style={[styles.ring, { borderColor: on ? colors.ink : 'transparent' }]}>
            <View style={[styles.swatch, { backgroundColor: hex }]} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  ring: { width: 44, height: 44, borderRadius: 22, borderWidth: 3, padding: 2 },
  swatch: { flex: 1, borderRadius: 99 },
});
