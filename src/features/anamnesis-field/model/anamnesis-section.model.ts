import { z } from 'zod';

export const AnamnesisSectionModelSchema = z.object({
  id: z.string(),
  anamnesisFormId: z.string(),
  label: z.string().trim().min(1).max(128),
  displayOrder: z.int(),
  active: z.boolean(),
  previousVersionId: z.string().optional(),
});

export type AnamnesisSectionModel = z.input<typeof AnamnesisSectionModelSchema>;
