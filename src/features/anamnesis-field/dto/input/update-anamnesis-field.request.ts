import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { AnamnesisFieldType } from '../../../../shared/domain/anamnesis-field.type';
import {
  AnamnesisFieldArgsSchema,
  AnamnesisFieldExtraLabelsSchema,
  CHOICE_FIELD_TYPES,
} from '../../model/anamnesis-field.model';
import { AnamnesisFieldValidationListInputSchema } from '../../model/anamnesis-field-validation.model';

export const UpdateAnamnesisFieldSchema = z
  .object({
    anamnesisSectionId: z.string().optional().nullable(),
    fieldType: z.enum(AnamnesisFieldType),
    fieldArgs: AnamnesisFieldArgsSchema.optional().nullable(),
    label: z.string().trim().min(1).max(128),
    extraLabels: AnamnesisFieldExtraLabelsSchema.optional().nullable(),
    active: z.boolean().default(true),
    displayOrder: z.int().default(0),
    validations: AnamnesisFieldValidationListInputSchema.default([]),
  })
  .refine(
    (data) =>
      CHOICE_FIELD_TYPES.has(data.fieldType)
        ? !!data.fieldArgs?.options.length
        : !data.fieldArgs,
    { message: 'fieldArgs.options is required only for RADIO/SELECT/CHECKBOX' },
  );

export class UpdateAnamnesisFieldDto extends createZodDto(
  UpdateAnamnesisFieldSchema,
  { type: 'output' },
) {}

export const UpdateAnamnesisFieldRequestSchema = z.object({
  anamnesisField: UpdateAnamnesisFieldSchema,
});

export class UpdateAnamnesisFieldRequest extends createZodDto(
  UpdateAnamnesisFieldRequestSchema,
  { type: 'output' },
) {}
