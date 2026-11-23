import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, layout, spacing } from '@/constants/theme';
import { formatDate, formatQuantity } from '@/features/lots/domain';
import type { Lot } from '@/features/lots/types';
import { UNIT_SHORT_LABELS } from '@/features/lots/types';

import { StatusBadge } from './status-badge';

export function LotRow({ lot, onPress }: { lot: Lot; onPress: () => void }) {
  const label = `${lot.productName}, lote ${lot.lotCode}, validade ${formatDate(lot.expiryDate)}`;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint="Abre a edição deste lote"
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}>
      <View style={styles.topRow}>
        <View style={styles.nameBlock}>
          <Text numberOfLines={2} style={styles.productName}>
            {lot.productName}
          </Text>
          <Text style={styles.metadata}>
            Lote {lot.lotCode} · {formatQuantity(lot.quantity)} {UNIT_SHORT_LABELS[lot.unit]}
          </Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={24} color={colors.muted} />
      </View>
      <View style={styles.bottomRow}>
        <StatusBadge status={lot.status} />
        <View style={styles.expiryBlock}>
          <Text style={styles.expiryLabel}>Validade</Text>
          <Text style={styles.expiryDate}>{formatDate(lot.expiryDate)}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: layout.touchTarget,
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing.lg,
    gap: spacing.md,
  },
  pressed: { backgroundColor: colors.surface },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  nameBlock: { flex: 1, gap: spacing.xs },
  productName: { color: colors.ink, fontSize: 17, lineHeight: 22, fontWeight: '700' },
  metadata: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  bottomRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: spacing.md },
  expiryBlock: { alignItems: 'flex-end' },
  expiryLabel: { color: colors.muted, fontSize: 12, lineHeight: 16 },
  expiryDate: { color: colors.ink, fontSize: 15, lineHeight: 20, fontWeight: '700' },
});
