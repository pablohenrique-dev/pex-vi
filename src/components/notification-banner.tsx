import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Linking from 'expo-linking';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '@/constants/theme';

import { Button } from './ui/button';
import { requestNotificationPermission } from '@/services/notifications';

export function NotificationBanner({ onPermissionChange }: { onPermissionChange: () => void }) {
  const activate = async () => {
    const granted = await requestNotificationPermission().catch(() => false);
    if (granted) onPermissionChange();
    else await Linking.openSettings();
  };

  return (
    <View accessibilityRole="alert" style={styles.container}>
      <MaterialCommunityIcons name="bell-off-outline" color={colors.warning} size={24} />
      <View style={styles.copy}>
        <Text style={styles.title}>Ative os avisos de validade</Text>
        <Text style={styles.body}>Sem permissão, os produtos continuam salvos, mas o celular não mostrará lembretes.</Text>
        <View style={styles.action}>
          <Button label="Ativar notificações" variant="ghost" onPress={activate} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    backgroundColor: colors.warningSoft,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  copy: { flex: 1, gap: spacing.xs },
  title: { color: colors.ink, fontSize: 15, lineHeight: 20, fontWeight: '700' },
  body: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  action: { alignSelf: 'flex-start', marginLeft: -spacing.lg, marginBottom: -spacing.md },
});
