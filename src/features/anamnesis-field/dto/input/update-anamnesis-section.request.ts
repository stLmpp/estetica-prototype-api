import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const UpdateAnamnesisSectionSchema = z
  .object({
    label: z.string().trim().min(1).max(128).optional(),
    active: z.boolean().optional(),
    displayOrder: z.int().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export class UpdateAnamnesisSectionDto extends createZodDto(
  UpdateAnamnesisSectionSchema,
  { type: 'output' },
) {}

export const UpdateAnamnesisSectionRequestSchema = z.object({
  anamnesisSection: UpdateAnamnesisSectionSchema,
});

export class UpdateAnamnesisSectionRequest extends createZodDto(
  UpdateAnamnesisSectionRequestSchema,
  { type: 'output' },
) {}
