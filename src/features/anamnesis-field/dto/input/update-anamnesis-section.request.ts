import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const UpdateAnamnesisSectionSchema = z.object({
  label: z.string().trim().min(1).max(128),
  active: z.boolean().default(true),
  displayOrder: z.int().default(0),
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
