import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const UpdateAnamnesisFormSchema = z
  .object({
    name: z.string().trim().min(1).max(256).optional(),
    description: z.string().trim().max(2048).optional().nullable(),
    active: z.boolean().optional(),
    displayOrder: z.int().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export class UpdateAnamnesisFormDto extends createZodDto(
  UpdateAnamnesisFormSchema,
  { type: 'output' },
) {}

export const UpdateAnamnesisFormRequestSchema = z.object({
  anamnesisForm: UpdateAnamnesisFormSchema,
});

export class UpdateAnamnesisFormRequest extends createZodDto(
  UpdateAnamnesisFormRequestSchema,
  { type: 'output' },
) {}
