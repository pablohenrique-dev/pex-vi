import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandMark } from '@/components/brand-mark';
import { Button } from '@/components/ui/button';
import { colors, layout, spacing } from '@/constants/theme';
import { markIntroSeen } from '@/db/settings';
import { requestNotificationPermission } from '@/services/notifications';

const benefits = [
  { icon: 'package-variant-closed', title: 'Controle por lote', body: 'Separe o mesmo produto por código, quantidade e validade.' },
  { icon: 'calendar-alert', title: 'Prioridade visível', body: 'Veja primeiro o que vence hoje ou nos próximos sete dias.' },
  { icon: 'bell-outline', title: 'Avisos no aparelho', body: 'Receba lembretes locais, sem cadastro, servidor ou internet.' },
] as const;

export default function IntroScreen() {
  const db = useSQLiteContext();
  const [loading, setLoading] = useState(false);

  const finish = async (requestPermission: boolean) => {
    setLoading(true);
    try {
      if (requestPermission) await requestNotificationPermission().catch(() => false);
      await markIntroSeen(db);
      router.replace('/');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
        <View style={styles.content}>
          <View style={styles.hero}>
            <BrandMark size={76} />
            <View style={styles.heroCopy}>
              <Text style={styles.brand}>No Prazo</Text>
              <Text style={styles.title}>Validade sob controle, sem complicação.</Text>
              <Text style={styles.subtitle}>Cadastre os lotes do estoque e saiba o que precisa de atenção antes que vire perda.</Text>
            </View>
          </View>
          <View style={styles.benefitList}>
            {benefits.map((benefit) => (
              <View key={benefit.title} style={styles.benefitRow}>
                <View style={styles.iconWrap}>
                  <MaterialCommunityIcons name={benefit.icon} size={24} color={colors.primary} />
                </View>
                <View style={styles.benefitCopy}>
                  <Text style={styles.benefitTitle}>{benefit.title}</Text>
                  <Text style={styles.benefitBody}>{benefit.body}</Text>
                </View>
              </View>
            ))}
          </View>
          <View style={styles.actions}>
            <Button
              label="Ativar notificações e começar"
              loading={loading}
              onPress={() => finish(true)}
              icon={<MaterialCommunityIcons name="bell-check-outline" size={21} color={colors.white} />}
            />
            <Button label="Agora não" variant="ghost" disabled={loading} onPress={() => finish(false)} />
            <Text style={styles.privacy}>Seus dados ficam somente neste aparelho.</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  scrollContent: { flexGrow: 1, paddingHorizontal: spacing.xl, paddingVertical: spacing.xxl },
  content: { width: '100%', maxWidth: layout.contentMaxWidth, alignSelf: 'center', flex: 1, gap: spacing.xxl },
  hero: { gap: spacing.xl },
  heroCopy: { gap: spacing.md },
  brand: { color: colors.primary, fontSize: 16, lineHeight: 22, fontWeight: '800' },
  title: { color: colors.ink, fontSize: 34, lineHeight: 40, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { color: colors.muted, fontSize: 17, lineHeight: 25 },
  benefitList: { gap: spacing.lg },
  benefitRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  iconWrap: { width: 46, height: 46, borderRadius: 12, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  benefitCopy: { flex: 1, gap: spacing.xs },
  benefitTitle: { color: colors.ink, fontSize: 15, lineHeight: 21, fontWeight: '700' },
  benefitBody: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  actions: { gap: spacing.sm },
  privacy: { color: colors.muted, fontSize: 12, lineHeight: 18, textAlign: 'center' },
});
