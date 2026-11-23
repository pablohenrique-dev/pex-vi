import { z } from 'zod';

import { todayIso } from './domain';
import { LOT_UNITS } from './types';

const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Informe uma data válida.');

export const lotFormSchema = z
  .object({
    productName: z.string().trim().min(2, 'Informe o nome do produto.').max(120),
    lotCode: z.string().trim().min(1, 'Informe o código do lote.').max(64),
    quantity: z
      .string()
      .trim()
      .min(1, 'Informe a quantidade.')
      .refine((value) => {
        const parsed = Number(value.replace(',', '.'));
        return Number.isFinite(parsed) && parsed > 0;
      }, 'A quantidade deve ser maior que zero.'),
    unit: z.enum(LOT_UNITS),
    manufactureDate: isoDateSchema,
    expiryDate: isoDateSchema,
  })
  .superRefine((values, context) => {
    if (values.manufactureDate > todayIso()) {
      context.addIssue({
        code: 'custom',
        path: ['manufactureDate'],
        message: 'A fabricação não pode estar no futuro.',
      });
    }
    if (values.expiryDate < values.manufactureDate) {
      context.addIssue({
        code: 'custom',
        path: ['expiryDate'],
        message: 'A validade deve ser igual ou posterior à fabricação.',
      });
    }
  });

export type LotFormValues = z.infer<typeof lotFormSchema>;

export function quantityToNumber(value: string) {
  return Number(value.replace(',', '.'));
}
