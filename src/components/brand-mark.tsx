import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleSheet, View } from 'react-native';

import { colors } from '@/constants/theme';

export function BrandMark({ size = 72, inverted = false }: { size?: number; inverted?: boolean }) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.mark,
        {
          width: size,
          height: size,
          borderRadius: Math.round(size * 0.24),
          backgroundColor: inverted ? colors.white : colors.primary,
        },
      ]}>
      <MaterialCommunityIcons
        name="calendar-check-outline"
        size={Math.round(size * 0.58)}
        color={inverted ? colors.primary : colors.white}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mark: { alignItems: 'center', justifyContent: 'center' },
});
