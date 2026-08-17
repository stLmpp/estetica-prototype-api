import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const CreateAnamnesisFormSchema = z.object({
  name: z.string().trim().min(1).max(256),
  description: z.string().trim().max(2048).optional().nullable(),
  active: z.boolean().default(true),
  displayOrder: z.int().default(0),
});

export class CreateAnamnesisFormDto extends createZodDto(
  CreateAnamnesisFormSchema,
  { type: 'output' },
) {}

export const CreateAnamnesisFormRequestSchema = z.object({
  anamnesisForm: CreateAnamnesisFormSchema,
});

export class CreateAnamnesisFormRequest extends createZodDto(
  CreateAnamnesisFormRequestSchema,
  { type: 'output' },
) {}
