import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '@/constants/theme';
import type { ExpiryStatus } from '@/features/lots/types';

const statusConfig = {
  ok: { label: 'Em dia', color: colors.success, background: colors.successSoft, icon: 'check-circle-outline' },
  expiring_soon: { label: 'Próximo', color: colors.warning, background: colors.warningSoft, icon: 'clock-outline' },
  expires_today: { label: 'Vence hoje', color: colors.warning, background: colors.warningSoft, icon: 'alert-circle-outline' },
  expired: { label: 'Vencido', color: colors.danger, background: colors.dangerSoft, icon: 'close-circle-outline' },
} as const;

export function StatusBadge({ status }: { status: ExpiryStatus }) {
  const config = statusConfig[status];
  return (
    <View
      accessibilityLabel={`Status: ${config.label}`}
      style={[styles.badge, { backgroundColor: config.background }]}>
      <MaterialCommunityIcons name={config.icon} color={config.color} size={15} />
      <Text style={[styles.label, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    minHeight: 28,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
  },
  label: { fontSize: 12, lineHeight: 16, fontWeight: '700' },
});
