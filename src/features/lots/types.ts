export const LOT_UNITS = ['un', 'kg', 'g', 'l', 'ml', 'caixa', 'pacote'] as const;

export type LotUnit = (typeof LOT_UNITS)[number];
export type ExpiryStatus = 'ok' | 'expiring_soon' | 'expires_today' | 'expired';

export type LotInput = {
  productName: string;
  lotCode: string;
  quantity: number;
  unit: LotUnit;
  manufactureDate: string;
  expiryDate: string;
};

export type Lot = LotInput & {
  id: string;
  productId: string;
  warningNotificationId: string | null;
  expiredNotificationId: string | null;
  createdAt: string;
  updatedAt: string;
  status: ExpiryStatus;
};

export type LotFilters = { query?: string; status?: ExpiryStatus };

export interface LotRepository {
  list(filters?: LotFilters): Promise<Lot[]>;
  get(id: string): Promise<Lot | null>;
  create(input: LotInput): Promise<Lot>;
  update(id: string, input: LotInput): Promise<Lot>;
  delete(id: string): Promise<void>;
}

export const UNIT_LABELS: Record<LotUnit, string> = {
  un: 'Unidade',
  kg: 'Quilograma',
  g: 'Grama',
  l: 'Litro',
  ml: 'Mililitro',
  caixa: 'Caixa',
  pacote: 'Pacote',
};

export const UNIT_SHORT_LABELS: Record<LotUnit, string> = {
  un: 'un',
  kg: 'kg',
  g: 'g',
  l: 'L',
  ml: 'mL',
  caixa: 'cx',
  pacote: 'pct',
};
