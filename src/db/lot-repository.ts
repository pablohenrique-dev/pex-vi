import type { SQLiteDatabase } from 'expo-sqlite';

import {
  createId,
  normalizeLotCode,
  normalizeProductName,
  withStatus,
} from '@/features/lots/domain';
import type { Lot, LotFilters, LotInput, LotRepository, LotUnit } from '@/features/lots/types';

type LotRow = {
  id: string;
  product_id: string;
  product_name: string;
  lot_code: string;
  quantity: number;
  unit: LotUnit;
  manufacture_date: string;
  expiry_date: string;
  warning_notification_id: string | null;
  expired_notification_id: string | null;
  created_at: string;
  updated_at: string;
};

const LOT_SELECT = `
  SELECT
    lots.id,
    lots.product_id,
    products.name AS product_name,
    lots.lot_code,
    lots.quantity,
    lots.unit,
    lots.manufacture_date,
    lots.expiry_date,
    lots.warning_notification_id,
    lots.expired_notification_id,
    lots.created_at,
    lots.updated_at
  FROM lots
  INNER JOIN products ON products.id = lots.product_id
`;

function mapLot(row: LotRow): Lot {
  return withStatus({
    id: row.id,
    productId: row.product_id,
    productName: row.product_name,
    lotCode: row.lot_code,
    quantity: row.quantity,
    unit: row.unit,
    manufactureDate: row.manufacture_date,
    expiryDate: row.expiry_date,
    warningNotificationId: row.warning_notification_id,
    expiredNotificationId: row.expired_notification_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}

export class DuplicateLotError extends Error {
  constructor() {
    super('Já existe um lote com este código para o produto informado.');
    this.name = 'DuplicateLotError';
  }
}

export class SqliteLotRepository implements LotRepository {
  constructor(private readonly db: SQLiteDatabase) {}

  async list(filters: LotFilters = {}) {
    const rows = await this.db.getAllAsync<LotRow>(`${LOT_SELECT} ORDER BY lots.expiry_date ASC`);
    const normalizedQuery = normalizeProductName(filters.query ?? '');
    const normalizedCodeQuery = normalizeLotCode(filters.query ?? '');

    return rows
      .map(mapLot)
      .filter((lot) => {
        const matchesQuery =
          !normalizedQuery ||
          normalizeProductName(lot.productName).includes(normalizedQuery) ||
          normalizeLotCode(lot.lotCode).includes(normalizedCodeQuery);
        const matchesStatus = !filters.status || lot.status === filters.status;
        return matchesQuery && matchesStatus;
      });
  }

  async get(id: string) {
    const row = await this.db.getFirstAsync<LotRow>(`${LOT_SELECT} WHERE lots.id = ?`, id);
    return row ? mapLot(row) : null;
  }

  async create(input: LotInput) {
    const lotId = createId('lot');
    const now = new Date().toISOString();

    try {
      await this.db.withExclusiveTransactionAsync(async (transaction) => {
        const normalizedName = normalizeProductName(input.productName);
        const existingProduct = await transaction.getFirstAsync<{ id: string }>(
          'SELECT id FROM products WHERE normalized_name = ?',
          normalizedName,
        );
        const productId = existingProduct?.id ?? createId('product');

        if (existingProduct) {
          await transaction.runAsync(
            'UPDATE products SET name = ?, updated_at = ? WHERE id = ?',
            input.productName.trim(),
            now,
            productId,
          );
        } else {
          await transaction.runAsync(
            'INSERT INTO products (id, name, normalized_name, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
            productId,
            input.productName.trim(),
            normalizedName,
            now,
            now,
          );
        }

        await transaction.runAsync(
          `INSERT INTO lots (
            id, product_id, lot_code, normalized_code, quantity, unit,
            manufacture_date, expiry_date, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          lotId,
          productId,
          input.lotCode.trim(),
          normalizeLotCode(input.lotCode),
          input.quantity,
          input.unit,
          input.manufactureDate,
          input.expiryDate,
          now,
          now,
        );
      });
    } catch (error) {
      if (String(error).includes('UNIQUE constraint failed')) throw new DuplicateLotError();
      throw error;
    }

    const created = await this.get(lotId);
    if (!created) throw new Error('Não foi possível carregar o lote salvo.');
    return created;
  }

  async update(id: string, input: LotInput) {
    const existing = await this.get(id);
    if (!existing) throw new Error('Lote não encontrado.');
    const now = new Date().toISOString();

    try {
      await this.db.withExclusiveTransactionAsync(async (transaction) => {
        const normalizedName = normalizeProductName(input.productName);
        const product = await transaction.getFirstAsync<{ id: string }>(
          'SELECT id FROM products WHERE normalized_name = ?',
          normalizedName,
        );
        const nextProductId = product?.id ?? createId('product');

        if (product) {
          await transaction.runAsync(
            'UPDATE products SET name = ?, updated_at = ? WHERE id = ?',
            input.productName.trim(),
            now,
            nextProductId,
          );
        } else {
          await transaction.runAsync(
            'INSERT INTO products (id, name, normalized_name, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
            nextProductId,
            input.productName.trim(),
            normalizedName,
            now,
            now,
          );
        }

        await transaction.runAsync(
          `UPDATE lots SET
            product_id = ?, lot_code = ?, normalized_code = ?, quantity = ?, unit = ?,
            manufacture_date = ?, expiry_date = ?, warning_notification_id = NULL,
            expired_notification_id = NULL, updated_at = ?
           WHERE id = ?`,
          nextProductId,
          input.lotCode.trim(),
          normalizeLotCode(input.lotCode),
          input.quantity,
          input.unit,
          input.manufactureDate,
          input.expiryDate,
          now,
          id,
        );

        if (existing.productId !== nextProductId) {
          await transaction.runAsync(
            'DELETE FROM products WHERE id = ? AND NOT EXISTS (SELECT 1 FROM lots WHERE product_id = ?)',
            existing.productId,
            existing.productId,
          );
        }
      });
    } catch (error) {
      if (String(error).includes('UNIQUE constraint failed')) throw new DuplicateLotError();
      throw error;
    }

    const updated = await this.get(id);
    if (!updated) throw new Error('Não foi possível carregar o lote atualizado.');
    return updated;
  }

  async delete(id: string) {
    const existing = await this.get(id);
    if (!existing) return;

    await this.db.withExclusiveTransactionAsync(async (transaction) => {
      await transaction.runAsync('DELETE FROM lots WHERE id = ?', id);
      await transaction.runAsync(
        'DELETE FROM products WHERE id = ? AND NOT EXISTS (SELECT 1 FROM lots WHERE product_id = ?)',
        existing.productId,
        existing.productId,
      );
    });
  }

  async setNotificationIds(id: string, warningId: string | null, expiredId: string | null) {
    await this.db.runAsync(
      `UPDATE lots
       SET warning_notification_id = ?, expired_notification_id = ?, updated_at = ?
       WHERE id = ?`,
      warningId,
      expiredId,
      new Date().toISOString(),
      id,
    );
  }

  async clearNotificationIds(id: string) {
    await this.setNotificationIds(id, null, null);
  }
}
