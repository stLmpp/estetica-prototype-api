import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { createResponseSchema } from '../../../../shared/model/response.model';
import { GetCustomerPhoneResSchema } from './get-customer.response';

export const SyncCustomerPhonesResponseSchema = createResponseSchema(
  z.object({
    phones: z.array(GetCustomerPhoneResSchema),
  }),
);

export class SyncCustomerPhonesResponseModel extends createZodDto(
  SyncCustomerPhonesResponseSchema,
) {}
