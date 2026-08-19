import { z } from 'zod';
import { createZodDto } from '@stlmpp/nestjs-zod';

export const CreateAnamnesisSectionSchema = z.object({
  label: z.string().trim().min(1).max(128),
  active: z.boolean().default(true),
  displayOrder: z.int().default(0),
});

export class CreateAnamnesisSectionDto extends createZodDto(
  CreateAnamnesisSectionSchema,
  { type: 'output' },
) {}

export const CreateAnamnesisSectionRequestSchema = z.object({
  anamnesisSection: CreateAnamnesisSectionSchema,
});

export class CreateAnamnesisSectionRequest extends createZodDto(
  CreateAnamnesisSectionRequestSchema,
  { type: 'output' },
) {}
