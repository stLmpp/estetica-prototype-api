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
    fieldType: z.enum(AnamnesisFieldType).optional(),
    fieldArgs: AnamnesisFieldArgsSchema.optional().nullable(),
    label: z.string().trim().min(1).max(128).optional(),
    extraLabels: AnamnesisFieldExtraLabelsSchema.optional().nullable(),
    active: z.boolean().optional(),
    displayOrder: z.int().optional(),
    validations: AnamnesisFieldValidationListInputSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  })
  .refine(
    (data) =>
      data.fieldType === undefined ||
      (CHOICE_FIELD_TYPES.has(data.fieldType)
        ? !!data.fieldArgs?.options.length
        : !data.fieldArgs),
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
