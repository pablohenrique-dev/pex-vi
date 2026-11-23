import { DefaultTheme, Stack, ThemeProvider, router } from 'expo-router';
import * as Notifications from 'expo-notifications';
import * as SplashScreen from 'expo-splash-screen';
import { SQLiteProvider } from 'expo-sqlite';
import { useEffect } from 'react';
import { AppState } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { colors } from '@/constants/theme';
import { migrateDatabase } from '@/db/migrations';
import { useLotRepository } from '@/hooks/use-lot-repository';
import { configureNotificationChannel, reconcileNotifications } from '@/services/notifications';

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ duration: 350, fade: true });

const appTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.background,
    text: colors.ink,
    border: colors.border,
    notification: colors.danger,
  },
};

function AppCoordinator() {
  const repository = useLotRepository();

  useEffect(() => {
    SplashScreen.hideAsync();
    configureNotificationChannel().catch(() => undefined);
    reconcileNotifications(repository).catch(() => undefined);

    const openNotification = async (response: Notifications.NotificationResponse) => {
      const lotId = response.notification.request.content.data?.lotId;
      if (typeof lotId === 'string' && (await repository.get(lotId))) {
        router.push({ pathname: '/lots/[id]', params: { id: lotId } });
      } else {
        router.replace('/');
      }
    };

    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) openNotification(response).finally(() => Notifications.clearLastNotificationResponse());
    });
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(openNotification);
    const appStateSubscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') reconcileNotifications(repository).catch(() => undefined);
    });

    return () => {
      responseSubscription.remove();
      appStateSubscription.remove();
    };
  }, [repository]);

  return null;
}

export default function RootLayout() {
  return (
    <SQLiteProvider databaseName="no-prazo.db" onInit={migrateDatabase}>
      <ThemeProvider value={appTheme}>
        <StatusBar style="dark" />
        <AppCoordinator />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.primary,
            headerTitleStyle: { color: colors.ink, fontWeight: '700' },
            headerShadowVisible: false,
            contentStyle: { backgroundColor: colors.surface },
          }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="intro" options={{ headerShown: false, gestureEnabled: false }} />
          <Stack.Screen name="lots/new" options={{ title: 'Novo produto' }} />
          <Stack.Screen name="lots/[id]" options={{ title: 'Editar lote' }} />
        </Stack>
      </ThemeProvider>
    </SQLiteProvider>
  );
}
