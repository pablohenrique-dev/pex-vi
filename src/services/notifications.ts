import { AndroidImportance, AndroidNotificationPriority } from 'expo-notifications';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { addCalendarDays, differenceInCalendarDays, formatDate, parseLocalDate, toIsoDate } from '@/features/lots/domain';
import type { Lot } from '@/features/lots/types';

import type { SqliteLotRepository } from '@/db/lot-repository';

const CHANNEL_ID = 'validade';
const NOTIFICATION_HOUR = 9;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    priority: AndroidNotificationPriority.DEFAULT,
  }),
});

export async function configureNotificationChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Validades',
    description: 'Avisos sobre produtos próximos da validade ou vencidos.',
    importance: AndroidImportance.DEFAULT,
    sound: 'default',
    vibrationPattern: [0, 220, 140, 220],
    lightColor: '#006B6B',
  });
}

export async function notificationPermissionGranted() {
  if (Platform.OS === 'web') return false;
  const permissions = await Notifications.getPermissionsAsync();
  return permissions.granted;
}

export async function requestNotificationPermission() {
  if (Platform.OS === 'web') return false;
  await configureNotificationChannel();
  const permissions = await Notifications.requestPermissionsAsync();
  return permissions.granted;
}

export async function cancelLotNotifications(lot: Pick<Lot, 'warningNotificationId' | 'expiredNotificationId'>) {
  const ids = [lot.warningNotificationId, lot.expiredNotificationId].filter(
    (id): id is string => Boolean(id),
  );
  await Promise.all(
    ids.map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined)),
  );
}

function atNotificationHour(dateValue: string) {
  const date = parseLocalDate(dateValue);
  date.setHours(NOTIFICATION_HOUR, 0, 0, 0);
  return date;
}

function nextMorning() {
  const now = new Date();
  const candidate = new Date();
  candidate.setHours(NOTIFICATION_HOUR, 0, 0, 0);
  if (candidate.getTime() <= now.getTime()) candidate.setDate(candidate.getDate() + 1);
  return candidate;
}

async function scheduleWarning(lot: Lot) {
  const now = new Date();
  const warningDate = atNotificationHour(addCalendarDays(lot.expiryDate, -7));
  const expiryDay = atNotificationHour(lot.expiryDate);
  const target = warningDate.getTime() > now.getTime() ? warningDate : nextMorning();
  if (target.getTime() > expiryDay.getTime()) return null;

  const days = Math.max(0, differenceInCalendarDays(lot.expiryDate, toIsoDate(target)));
  const timing = days === 0 ? 'vence hoje' : `vence em ${days} ${days === 1 ? 'dia' : 'dias'}`;
  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'Produto próximo da validade',
      body: `${lot.productName} · lote ${lot.lotCode} ${timing} (${formatDate(lot.expiryDate)}).`,
      data: { lotId: lot.id },
      sound: 'default',
      color: '#006B6B',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: target,
      channelId: CHANNEL_ID,
      delivery: 'bestEffort',
    },
  });
}

async function scheduleExpired(lot: Lot) {
  const target = atNotificationHour(addCalendarDays(lot.expiryDate, 1));
  if (target.getTime() <= Date.now()) return null;

  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'Produto vencido',
      body: `${lot.productName} · lote ${lot.lotCode} venceu em ${formatDate(lot.expiryDate)}.`,
      data: { lotId: lot.id },
      sound: 'default',
      color: '#B42318',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: target,
      channelId: CHANNEL_ID,
      delivery: 'bestEffort',
    },
  });
}

export async function scheduleLotNotifications(repository: SqliteLotRepository, lot: Lot) {
  await cancelLotNotifications(lot);
  if (!(await notificationPermissionGranted())) {
    await repository.clearNotificationIds(lot.id);
    return false;
  }

  await configureNotificationChannel();
  let warningId: string | null = null;
  let expiredId: string | null = null;
  try {
    warningId = lot.status === 'expired' ? null : await scheduleWarning(lot);
    expiredId = lot.status === 'expired' ? null : await scheduleExpired(lot);
    await repository.setNotificationIds(lot.id, warningId, expiredId);
    return true;
  } catch (error) {
    await cancelLotNotifications({
      warningNotificationId: warningId,
      expiredNotificationId: expiredId,
    });
    await repository.clearNotificationIds(lot.id);
    throw error;
  }
}

export async function reconcileNotifications(repository: SqliteLotRepository) {
  if (!(await notificationPermissionGranted())) return;
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const scheduledIds = new Set(scheduled.map((request) => request.identifier));
  const lots = await repository.list();

  for (const lot of lots) {
    if (lot.status === 'expired') {
      await cancelLotNotifications(lot);
      if (lot.warningNotificationId || lot.expiredNotificationId) {
        await repository.clearNotificationIds(lot.id);
      }
      continue;
    }

    const warningIsValid = !lot.warningNotificationId || scheduledIds.has(lot.warningNotificationId);
    const expiredIsValid = !lot.expiredNotificationId || scheduledIds.has(lot.expiredNotificationId);
    const hasAnyScheduled = Boolean(lot.warningNotificationId || lot.expiredNotificationId);
    if (!warningIsValid && expiredIsValid && lot.expiredNotificationId) {
      await repository.setNotificationIds(lot.id, null, lot.expiredNotificationId);
      continue;
    }
    if (!hasAnyScheduled || !expiredIsValid) {
      await scheduleLotNotifications(repository, lot);
    }
  }
}
