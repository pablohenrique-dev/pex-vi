import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Redirect, router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FilterChip } from '@/components/filter-chip';
import { LotRow } from '@/components/lot-row';
import { NotificationBanner } from '@/components/notification-banner';
import { Button } from '@/components/ui/button';
import { colors, layout, shadows, spacing } from '@/constants/theme';
import { hasSeenIntro } from '@/db/settings';
import type { ExpiryStatus, Lot } from '@/features/lots/types';
import { useLotRepository } from '@/hooks/use-lot-repository';
import { notificationPermissionGranted } from '@/services/notifications';

type FilterValue = 'all' | ExpiryStatus;

const filters: { label: string; value: FilterValue }[] = [
  { label: 'Todos', value: 'all' },
  { label: 'Vence hoje', value: 'expires_today' },
  { label: 'A vencer', value: 'expiring_soon' },
  { label: 'Vencidos', value: 'expired' },
  { label: 'Em dia', value: 'ok' },
];

const sectionMeta: { status: ExpiryStatus; title: string; description: string }[] = [
  { status: 'expires_today', title: 'Vence hoje', description: 'Prioridade máxima para venda ou retirada.' },
  { status: 'expiring_soon', title: 'Próximos 7 dias', description: 'Ainda há tempo para agir.' },
  { status: 'expired', title: 'Vencidos', description: 'Separe estes itens do estoque disponível.' },
  { status: 'ok', title: 'Em dia', description: 'Nenhuma ação imediata.' },
];

export default function HomeScreen() {
  const db = useSQLiteContext();
  const repository = useLotRepository();
  const [introSeen, setIntroSeen] = useState<boolean | null>(null);
  const [lots, setLots] = useState<Lot[]>([]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterValue>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const load = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      try {
        const [seen, items, permission] = await Promise.all([
          hasSeenIntro(db),
          repository.list(),
          notificationPermissionGranted(),
        ]);
        setIntroSeen(seen);
        setLots(items);
        setNotificationsEnabled(permission);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [db, repository],
  );

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const visibleLots = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('pt-BR');
    return lots.filter((lot) => {
      const matchesFilter = filter === 'all' || lot.status === filter;
      const matchesSearch =
        !normalized ||
        lot.productName.toLocaleLowerCase('pt-BR').includes(normalized) ||
        lot.lotCode.toLocaleLowerCase('pt-BR').includes(normalized);
      return matchesFilter && matchesSearch;
    });
  }, [filter, lots, query]);

  const sections = useMemo(
    () =>
      sectionMeta
        .map((meta) => ({
          ...meta,
          data: visibleLots
            .filter((lot) => lot.status === meta.status)
            .sort((a, b) =>
              meta.status === 'expired'
                ? b.expiryDate.localeCompare(a.expiryDate)
                : a.expiryDate.localeCompare(b.expiryDate),
            ),
        }))
        .filter((section) => section.data.length > 0),
    [visibleLots],
  );

  if (introSeen === false) return <Redirect href="/intro" />;

  const listHeader = (
    <View style={styles.headerContent}>
      <View style={styles.headingRow}>
        <View style={styles.headingCopy}>
          <Text style={styles.overline}>NO PRAZO</Text>
          <Text style={styles.title}>Controle de validade</Text>
          <Text style={styles.subtitle}>Acompanhe cada lote e aja antes que o estoque vire perda.</Text>
        </View>
        <View style={styles.headerIcon}>
          <MaterialCommunityIcons name="calendar-check-outline" size={28} color={colors.primary} />
        </View>
      </View>
      {!notificationsEnabled && introSeen ? <NotificationBanner onPermissionChange={() => load()} /> : null}
      <View style={styles.searchWrap}>
        <MaterialCommunityIcons name="magnify" size={22} color={colors.muted} />
        <TextInput
          accessibilityLabel="Buscar produto ou lote"
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar produto ou lote"
          placeholderTextColor={colors.muted}
          style={styles.searchInput}
          returnKeyType="search"
        />
        {query ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Limpar busca" onPress={() => setQuery('')} style={styles.clearButton}>
            <MaterialCommunityIcons name="close-circle" size={21} color={colors.muted} />
          </Pressable>
        ) : null}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {filters.map((item) => (
          <FilterChip
            key={item.value}
            label={item.label}
            selected={filter === item.value}
            onPress={() => setFilter(item.value)}
          />
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {loading && introSeen === null ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.loadingText}>Organizando seus lotes…</Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={listHeader}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <View style={styles.countBadge}><Text style={styles.countText}>{section.data.length}</Text></View>
              </View>
              <Text style={styles.sectionDescription}>{section.description}</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <View style={styles.rowWrap}>
              <LotRow lot={item} onPress={() => router.push({ pathname: '/lots/[id]', params: { id: item.id } })} />
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <MaterialCommunityIcons
                  name={lots.length === 0 ? 'package-variant-plus' : 'magnify-close'}
                  size={34}
                  color={colors.primary}
                />
              </View>
              <Text style={styles.emptyTitle}>{lots.length === 0 ? 'Cadastre seu primeiro lote' : 'Nenhum lote encontrado'}</Text>
              <Text style={styles.emptyBody}>
                {lots.length === 0
                  ? 'Comece adicionando um produto, sua quantidade e as datas de fabricação e validade.'
                  : 'Altere a busca ou escolha outro filtro para ver mais resultados.'}
              </Text>
              {lots.length === 0 ? <View style={styles.emptyAction}><Button label="Adicionar produto" onPress={() => router.push('/lots/new')} /></View> : null}
            </View>
          }
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={colors.primary} colors={[colors.primary]} />}
        />
      )}
      {lots.length > 0 ? (
        <View style={styles.fab}>
          <Button
            label="Adicionar produto"
            onPress={() => router.push('/lots/new')}
            icon={<MaterialCommunityIcons name="plus" size={22} color={colors.white} />}
          />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.surface },
  listContent: { paddingBottom: 112, width: '100%', maxWidth: layout.contentMaxWidth, alignSelf: 'center' },
  headerContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.xl, gap: spacing.xl },
  headingRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.lg },
  headingCopy: { flex: 1, gap: spacing.sm },
  overline: { color: colors.primary, fontSize: 12, lineHeight: 16, fontWeight: '800', letterSpacing: 1.2 },
  title: { color: colors.ink, fontSize: 30, lineHeight: 36, fontWeight: '800', letterSpacing: -0.4 },
  subtitle: { color: colors.muted, fontSize: 15, lineHeight: 22 },
  headerIcon: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft },
  searchWrap: { minHeight: 52, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background, paddingLeft: spacing.lg, flexDirection: 'row', alignItems: 'center' },
  searchInput: { flex: 1, minHeight: 52, paddingHorizontal: spacing.md, color: colors.ink, fontSize: 16 },
  clearButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  filterRow: { gap: spacing.sm, paddingRight: spacing.lg },
  sectionHeader: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.md, backgroundColor: colors.surface, gap: spacing.xs },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  sectionTitle: { color: colors.ink, fontSize: 19, lineHeight: 24, fontWeight: '800' },
  countBadge: { minWidth: 26, height: 26, borderRadius: 999, paddingHorizontal: spacing.sm, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceStrong },
  countText: { color: colors.ink, fontSize: 12, lineHeight: 16, fontWeight: '800' },
  sectionDescription: { color: colors.muted, fontSize: 13, lineHeight: 18 },
  rowWrap: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  emptyState: { alignItems: 'center', paddingHorizontal: spacing.xxl, paddingVertical: spacing.xxxl, gap: spacing.md },
  emptyIcon: { width: 68, height: 68, borderRadius: 18, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { color: colors.ink, fontSize: 20, lineHeight: 26, fontWeight: '800', textAlign: 'center' },
  emptyBody: { color: colors.muted, fontSize: 15, lineHeight: 22, textAlign: 'center', maxWidth: 420 },
  emptyAction: { marginTop: spacing.sm, alignSelf: 'stretch' },
  fab: { position: 'absolute', right: spacing.lg, bottom: spacing.xl, ...shadows.floating },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  loadingText: { color: colors.muted, fontSize: 15, lineHeight: 22 },
});
