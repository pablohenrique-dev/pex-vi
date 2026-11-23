import type { SQLiteDatabase } from 'expo-sqlite';

const DATABASE_VERSION = 1;

export async function migrateDatabase(db: SQLiteDatabase) {
  await db.execAsync('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;');
  const versionRow = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = versionRow?.user_version ?? 0;

  if (currentVersion >= DATABASE_VERSION) return;

  await db.execAsync(`
    BEGIN TRANSACTION;

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      normalized_name TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS lots (
      id TEXT PRIMARY KEY NOT NULL,
      product_id TEXT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
      lot_code TEXT NOT NULL,
      normalized_code TEXT NOT NULL,
      quantity REAL NOT NULL CHECK(quantity > 0),
      unit TEXT NOT NULL CHECK(unit IN ('un', 'kg', 'g', 'l', 'ml', 'caixa', 'pacote')),
      manufacture_date TEXT NOT NULL,
      expiry_date TEXT NOT NULL,
      warning_notification_id TEXT,
      expired_notification_id TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(product_id, normalized_code)
    );

    CREATE INDEX IF NOT EXISTS idx_lots_expiry_date ON lots(expiry_date);
    CREATE INDEX IF NOT EXISTS idx_lots_product_id ON lots(product_id);

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );

    PRAGMA user_version = 1;
    COMMIT;
  `);
}
