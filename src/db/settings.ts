import type { SQLiteDatabase } from 'expo-sqlite';

export const SETTINGS = {
  introSeen: 'intro_seen',
} as const;

export async function getSetting(db: SQLiteDatabase, key: string) {
  const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM settings WHERE key = ?', key);
  return row?.value ?? null;
}

export async function setSetting(db: SQLiteDatabase, key: string, value: string) {
  await db.runAsync(
    `INSERT INTO settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    key,
    value,
  );
}

export async function hasSeenIntro(db: SQLiteDatabase) {
  return (await getSetting(db, SETTINGS.introSeen)) === 'true';
}

export async function markIntroSeen(db: SQLiteDatabase) {
  await setSetting(db, SETTINGS.introSeen, 'true');
}
