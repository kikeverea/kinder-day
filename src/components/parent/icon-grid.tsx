import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Emoji } from '@/components/emoji';
import { ICONS } from '@/domain/constants';
import { colors } from '@/theme/tokens';

const COLUMNS = 6;
const GAP = 8;

/** 6-column grid of icons (the 30 routine/step icons by default); the selected one gets an ink ring. */
export function IconGrid({
  value,
  onChange,
  emojiSize = 26,
  icons = ICONS,
}: {
  value: string;
  onChange: (emoji: string) => void;
  emojiSize?: number;
  icons?: readonly string[];
}) {
  const [width, setWidth] = useState(0);
  // Floor so six cells plus gaps never exceed the row (float rounding would wrap the 6th),
  // then let space-between absorb the leftover pixels so the grid spans the full width.
  const cell = width ? Math.floor((width - GAP * (COLUMNS - 1)) / COLUMNS) : 0;

  return (
    <View style={styles.grid} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {cell > 0 &&
        icons.map((emoji) => {
          const on = emoji === value;
          return (
            <Pressable
              key={emoji}
              onPress={() => onChange(emoji)}
              accessibilityState={{ selected: on }}
              style={[
                styles.cell,
                { width: cell, height: cell, borderColor: on ? colors.ink : 'transparent' },
                on && styles.selected,
              ]}>
              <Emoji size={emojiSize}>{emoji}</Emoji>
            </Pressable>
          );
        })}
      {/* Pad the last row so space-between doesn't spread a partial row. */}
      {cell > 0 &&
        Array.from({ length: (COLUMNS - (icons.length % COLUMNS)) % COLUMNS }, (_, i) => (
          <View key={`pad-${i}`} style={{ width: cell }} />
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: GAP },
  cell: { borderRadius: 14, borderWidth: 2.5, alignItems: 'center', justifyContent: 'center' },
  selected: { backgroundColor: colors.pressedTintSoft },
});
