import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Emoji } from '@/components/emoji';
import { ICONS } from '@/domain/constants';
import { colors } from '@/theme/tokens';

const COLUMNS = 6;
const GAP = 8;

/** 6-column grid of the 30 icons; the selected one gets an ink ring. */
export function IconGrid({
  value,
  onChange,
  emojiSize = 26,
}: {
  value: string;
  onChange: (emoji: string) => void;
  emojiSize?: number;
}) {
  const [width, setWidth] = useState(0);
  const cell = width ? (width - GAP * (COLUMNS - 1)) / COLUMNS : 0;

  return (
    <View style={styles.grid} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {cell > 0 &&
        ICONS.map((emoji) => {
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
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
  cell: { borderRadius: 14, borderWidth: 2.5, alignItems: 'center', justifyContent: 'center' },
  selected: { backgroundColor: colors.pressedTintSoft },
});
