import { z } from 'zod';
import { AnamnesisFieldType } from '../../../shared/domain/anamnesis-field.type';

const AnamnesisFieldOptionSchema = z.object({
  value: z.string(),
  label: z.string(),
});

export const CustomerAnamnesisFieldExtraValuesSchema = z.object({
  values: z.array(z.string()),
});

export const CustomerAnamnesisFieldModelSchema = z.object({
  id: z.string(),
  anamnesisFieldId: z.string(),
  value: z.string(),
  extraValues: CustomerAnamnesisFieldExtraValuesSchema.optional(),
  // Snapshotted at answer time — see customer_anamnesis_field's
  // fieldLabel/fieldType/fieldOptions/sectionLabel columns. Always present
  // (not resolved live), so this keeps reading correctly forever, even if
  // the underlying anamnesis_field/anamnesis_section is later edited,
  // deactivated, or deleted.
  anamnesisFieldLabel: z.string(),
  anamnesisFieldType: z.enum(AnamnesisFieldType),
  anamnesisFieldOptions: z.array(AnamnesisFieldOptionSchema).optional(),
  anamnesisFieldDisplayOrder: z.int(),
  anamnesisSectionLabel: z.string().optional(),
  anamnesisSectionDisplayOrder: z.int().optional(),
});

export type CustomerAnamnesisFieldModel = z.input<
  typeof CustomerAnamnesisFieldModelSchema
>;
