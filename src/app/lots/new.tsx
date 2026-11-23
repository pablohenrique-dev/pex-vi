import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LotForm } from '@/components/lot-form';
import { colors, layout, spacing } from '@/constants/theme';
import { DuplicateLotError } from '@/db/lot-repository';
import type { LotInput } from '@/features/lots/types';
import { useLotRepository } from '@/hooks/use-lot-repository';
import { scheduleLotNotifications } from '@/services/notifications';

export default function NewLotScreen() {
  const repository = useLotRepository();
  const [saving, setSaving] = useState(false);

  const save = async (input: LotInput) => {
    setSaving(true);
    try {
      const lot = await repository.create(input);
      await scheduleLotNotifications(repository, lot).catch(() => false);
      router.replace('/');
    } catch (error) {
      Alert.alert(
        'Não foi possível salvar',
        error instanceof DuplicateLotError ? error.message : 'Não foi possível salvar o lote. Tente novamente.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <View style={styles.heading}>
              <Text style={styles.title}>Cadastrar produto e lote</Text>
              <Text style={styles.subtitle}>Cada validade diferente deve ser registrada como um lote separado.</Text>
            </View>
            <LotForm submitLabel="Salvar lote" loading={saving} onSubmit={save} />
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
  heading: { gap: spacing.sm },
  title: { color: colors.ink, fontSize: 24, lineHeight: 30, fontWeight: '800' },
  subtitle: { color: colors.muted, fontSize: 15, lineHeight: 22 },
});
