import { z } from 'zod';
import { AnamnesisFieldType } from '../../../shared/domain/anamnesis-field.type';
import { AnamnesisFieldValidationModelSchema } from './anamnesis-field-validation.model';

const AnamnesisFieldOptionSchema = z.object({
  value: z.string().trim().min(1).max(128),
  label: z.string().trim().min(1).max(128),
});

export const AnamnesisFieldArgsSchema = z.object({
  options: z.array(AnamnesisFieldOptionSchema).min(1),
});

export const AnamnesisFieldExtraLabelsSchema = z.object({
  description: z.string().trim().max(2048).optional(),
});

export const CHOICE_FIELD_TYPES = new Set([
  AnamnesisFieldType.RADIO,
  AnamnesisFieldType.SELECT,
  AnamnesisFieldType.CHECKBOX,
]);

export const AnamnesisFieldModelSchema = z.object({
  id: z.string(),
  anamnesisFormId: z.string(),
  anamnesisSectionId: z.string().optional(),
  fieldType: z.enum(AnamnesisFieldType),
  fieldArgs: AnamnesisFieldArgsSchema.optional(),
  label: z.string().trim().min(1).max(128),
  extraLabels: AnamnesisFieldExtraLabelsSchema.optional(),
  active: z.boolean(),
  displayOrder: z.int(),
  validations: z.array(AnamnesisFieldValidationModelSchema).optional(),
});

export type AnamnesisFieldModel = z.input<typeof AnamnesisFieldModelSchema>;
