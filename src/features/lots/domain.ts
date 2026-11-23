import type { ExpiryStatus, Lot, LotInput } from './types';

export function normalizeProductName(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .trim()
    .replace(/\s+/g, ' ');
}

export function normalizeLotCode(value: string) {
  return value.trim().replace(/\s+/g, ' ').toLocaleUpperCase('pt-BR');
}

export function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseLocalDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

export function todayIso() {
  return toIsoDate(new Date());
}

export function addCalendarDays(value: string, days: number) {
  const date = parseLocalDate(value);
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
}

export function differenceInCalendarDays(later: string, earlier: string) {
  const laterDate = parseLocalDate(later);
  const earlierDate = parseLocalDate(earlier);
  const laterUtc = Date.UTC(laterDate.getFullYear(), laterDate.getMonth(), laterDate.getDate());
  const earlierUtc = Date.UTC(earlierDate.getFullYear(), earlierDate.getMonth(), earlierDate.getDate());
  return Math.round((laterUtc - earlierUtc) / 86_400_000);
}

export function getExpiryStatus(expiryDate: string, today = todayIso()): ExpiryStatus {
  const days = differenceInCalendarDays(expiryDate, today);
  if (days < 0) return 'expired';
  if (days === 0) return 'expires_today';
  if (days <= 7) return 'expiring_soon';
  return 'ok';
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(parseLocalDate(value));
}

export function formatQuantity(quantity: number) {
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 3 }).format(quantity);
}

export function withStatus(lot: Omit<Lot, 'status'>): Lot {
  return { ...lot, status: getExpiryStatus(lot.expiryDate) };
}

export function isSameLotInput(a: LotInput, b: LotInput) {
  return (
    normalizeProductName(a.productName) === normalizeProductName(b.productName) &&
    normalizeLotCode(a.lotCode) === normalizeLotCode(b.lotCode) &&
    a.quantity === b.quantity &&
    a.unit === b.unit &&
    a.manufactureDate === b.manufactureDate &&
    a.expiryDate === b.expiryDate
  );
}

export function createId(prefix: 'product' | 'lot') {
  const random = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${random}`;
}
