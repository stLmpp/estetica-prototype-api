import { z } from 'zod';

const MonetaryAmountSchema = z
  .string()
  .trim()
  .regex(/^\d{1,8}(\.\d{1,2})?$/);

export const CustomerFollowupItemInputSchema = z.object({
  description: z.string().trim().min(1).max(2048),
  catalogItemId: z.string().trim().min(1).optional(),
  quantity: z.int().positive().default(1),
  priceApplied: MonetaryAmountSchema,
});

export type CustomerFollowupItemInput = z.output<
  typeof CustomerFollowupItemInputSchema
>;

export const CustomerFollowupItemModelSchema = z.object({
  id: z.string(),
  description: z.string(),
  catalogItemId: z.string().optional(),
  catalogItemName: z.string().optional(),
  quantity: z.int().positive(),
  priceApplied: MonetaryAmountSchema,
});

export type CustomerFollowupItemModel = z.input<
  typeof CustomerFollowupItemModelSchema
>;
