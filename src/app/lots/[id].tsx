import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LotForm } from '@/components/lot-form';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { colors, layout, spacing } from '@/constants/theme';
import { DuplicateLotError } from '@/db/lot-repository';
import { formatDate } from '@/features/lots/domain';
import type { Lot, LotInput } from '@/features/lots/types';
import { useLotRepository } from '@/hooks/use-lot-repository';
import { cancelLotNotifications, scheduleLotNotifications } from '@/services/notifications';

export default function EditLotScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const repository = useLotRepository();
  const [lot, setLot] = useState<Lot | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      repository.get(id).then((item) => {
        if (active) {
          setLot(item);
          setLoading(false);
        }
      });
      return () => { active = false; };
    }, [id, repository]),
  );

  const save = async (input: LotInput) => {
    if (!lot) return;
    setSaving(true);
    try {
      const updated = await repository.update(lot.id, input);
      await scheduleLotNotifications(repository, updated).catch(() => false);
      router.replace('/');
    } catch (error) {
      Alert.alert(
        'Não foi possível atualizar',
        error instanceof DuplicateLotError ? error.message : 'Não foi possível atualizar o lote. Tente novamente.',
      );
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = () => {
    if (!lot) return;
    Alert.alert('Excluir este lote?', `${lot.productName} · lote ${lot.lotCode} será removido permanentemente.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            await repository.delete(lot.id);
            await cancelLotNotifications(lot).catch(() => undefined);
            router.replace('/');
          } catch {
            setDeleting(false);
            Alert.alert('Não foi possível excluir', 'Tente novamente.');
          }
        },
      },
    ]);
  };

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator color={colors.primary} size="large" /></View>;
  }
  if (!lot) {
    return (
      <View style={styles.centered}>
        <MaterialCommunityIcons name="package-variant-remove" size={42} color={colors.muted} />
        <Text style={styles.notFoundTitle}>Lote não encontrado</Text>
        <Text style={styles.notFoundBody}>Ele pode ter sido excluído em outra ação.</Text>
        <Button label="Voltar à listagem" onPress={() => router.replace('/')} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <View style={styles.summary}>
              <View style={styles.summaryHeader}>
                <View style={styles.summaryCopy}>
                  <Text style={styles.productName}>{lot.productName}</Text>
                  <Text style={styles.lotCode}>Lote {lot.lotCode}</Text>
                </View>
                <StatusBadge status={lot.status} />
              </View>
              <Text style={styles.expiry}>Validade atual: {formatDate(lot.expiryDate)}</Text>
            </View>
            <LotForm initialValues={lot} submitLabel="Salvar alterações" loading={saving} onSubmit={save} />
            <View style={styles.dangerZone}>
              <Text style={styles.dangerTitle}>Remover do estoque</Text>
              <Text style={styles.dangerBody}>A exclusão remove o lote e cancela todos os avisos associados.</Text>
              <Button
                label="Excluir lote"
                variant="danger"
                loading={deleting}
                onPress={confirmDelete}
                icon={<MaterialCommunityIcons name="trash-can-outline" size={21} color={colors.white} />}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: colors.surface },
  scrollContent: { padding: spacing.lg },
  content: { width: '100%', maxWidth: layout.contentMaxWidth, alignSelf: 'center', gap: spacing.xl },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.md, backgroundColor: colors.surface },
  notFoundTitle: { color: colors.ink, fontSize: 20, lineHeight: 26, fontWeight: '800' },
  notFoundBody: { color: colors.muted, fontSize: 15, lineHeight: 22, textAlign: 'center' },
  summary: { backgroundColor: colors.primarySoft, borderRadius: 14, padding: spacing.lg, gap: spacing.md },
  summaryHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.md },
  summaryCopy: { flex: 1, gap: spacing.xs },
  productName: { color: colors.ink, fontSize: 20, lineHeight: 26, fontWeight: '800' },
  lotCode: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  expiry: { color: colors.ink, fontSize: 14, lineHeight: 20, fontWeight: '600' },
  dangerZone: { borderRadius: 14, backgroundColor: colors.dangerSoft, padding: spacing.lg, gap: spacing.md, marginBottom: spacing.xl },
  dangerTitle: { color: colors.danger, fontSize: 17, lineHeight: 22, fontWeight: '800' },
  dangerBody: { color: colors.ink, fontSize: 14, lineHeight: 20 },
});
