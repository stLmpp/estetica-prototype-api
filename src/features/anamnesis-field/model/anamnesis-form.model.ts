import { z } from 'zod';

export const AnamnesisFormModelSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(1).max(256),
  description: z.string().trim().max(2048).optional(),
  active: z.boolean(),
  displayOrder: z.int(),
});

export type AnamnesisFormModel = z.input<typeof AnamnesisFormModelSchema>;
