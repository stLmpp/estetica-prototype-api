import { z } from 'zod';
import { CustomerAnamnesisStatus } from '../../../shared/domain/customer-anamnesis-status.enum';
import { DatetimeSchema } from '../../../shared/model/common.model';
import { CustomerAnamnesisFieldModelSchema } from './customer-anamnesis-field.model';

export const CustomerAnamnesisModelSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  anamnesisFormId: z.string(),
  appointmentId: z.string().optional(),
  date: DatetimeSchema,
  status: z.enum(CustomerAnamnesisStatus),
  signedByName: z.string().optional(),
  signedAt: DatetimeSchema.optional(),
  answers: z.array(CustomerAnamnesisFieldModelSchema).optional(),
});

export type CustomerAnamnesisModel = z.input<
  typeof CustomerAnamnesisModelSchema
>;
