import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { PhoneType } from '../../../../shared/domain/phone-type.enum';
import { createResponseSchema } from '../../../../shared/model/response.model';
import {
  DatetimeSchema,
  PhoneNumberSchema,
} from '../../../../shared/model/common.model';
import { ConfigType } from '../../../../shared/domain/config-type.enum';

export const CustomerPhoneResSchema = z.object({
  id: z.string(),
  type: z.enum(PhoneType),
  number: PhoneNumberSchema,
});

export const PublishConfigResSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(1).max(256),
  displayName: z.string().trim().min(1).max(256),
  description: z.string().trim().min(1).max(1024).optional(),
  version: z.int().positive(),
  userId: z.string().trim().min(1).max(64),
  tenantId: z.string().trim().min(1).max(64),
  inactivatedAt: DatetimeSchema.optional(),
  value: z.string().trim().min(1).max(65_536),
  type: z.enum(ConfigType),
  group: z.string().trim().min(1).max(256),
});

export type PublishConfigResDto = z.input<typeof PublishConfigResSchema>;

export const PublishConfigResponseSchema = createResponseSchema(
  z.object({
    config: PublishConfigResSchema,
    oldConfig: PublishConfigResSchema.optional(),
  }),
);

export class PublishConfigResponseModel extends createZodDto(
  PublishConfigResponseSchema,
) {}
