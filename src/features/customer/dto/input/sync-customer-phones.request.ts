import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { PhoneType } from '../../../../shared/domain/phone-type.enum';
import { PhoneNumberSchema } from '../../../../shared/model/common.model';

export const SyncCustomerPhoneSchema = z.object({
  type: z.enum(PhoneType),
  number: PhoneNumberSchema,
});

export const SyncCustomerPhonesSchema = z.object({
  phones: z.array(SyncCustomerPhoneSchema),
});

export class SyncCustomerPhonesDto extends createZodDto(
  SyncCustomerPhonesSchema,
  { type: 'output' },
) {}

export const SyncCustomerPhonesRequestSchema = z.object({
  customer: SyncCustomerPhonesSchema,
});

export class SyncCustomerPhonesRequest extends createZodDto(
  SyncCustomerPhonesRequestSchema,
  { type: 'output' },
) {}
