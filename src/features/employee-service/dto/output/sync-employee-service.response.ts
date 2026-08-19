import { z } from 'zod';
import { createZodDto } from '@stlmpp/nestjs-zod';
import { createResponseSchema } from '../../../../shared/model/response.model';
import { CreateEmployeeServiceResSchema } from './create-employee-service.response';

export const SyncEmployeeServiceResponseSchema = createResponseSchema(
  z.object({
    employeeServices: z.array(CreateEmployeeServiceResSchema),
  }),
);

export class SyncEmployeeServiceResponseModel extends createZodDto(
  SyncEmployeeServiceResponseSchema,
) {}
