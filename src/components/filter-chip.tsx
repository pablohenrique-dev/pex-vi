import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, layout, spacing } from '@/constants/theme';

export function FilterChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected ? styles.selected : styles.unselected,
        pressed && styles.pressed,
      ]}>
      <Text style={[styles.label, selected ? styles.selectedLabel : styles.unselectedLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: layout.touchTarget,
    borderRadius: 999,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selected: { backgroundColor: colors.primary },
  unselected: { backgroundColor: colors.surfaceStrong },
  pressed: { opacity: 0.78 },
  label: { fontSize: 14, lineHeight: 20, fontWeight: '700' },
  selectedLabel: { color: colors.white },
  unselectedLabel: { color: colors.ink },
});
