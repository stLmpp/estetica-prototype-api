import { z } from 'zod';
import { createZodDto } from '@stlmpp/nestjs-zod';
import { createResponseSchema } from '../../../../shared/model/response.model';

export const CreateEmployeeServiceResSchema = z.object({
  id: z.string(),
  employeeId: z.string(),
  catalogItemId: z.string(),
});

export type CreateEmployeeServiceResDto = z.input<
  typeof CreateEmployeeServiceResSchema
>;

export const CreateEmployeeServiceResponseSchema = createResponseSchema(
  z.object({
    employeeService: CreateEmployeeServiceResSchema,
  }),
);

export class CreateEmployeeServiceResponseModel extends createZodDto(
  CreateEmployeeServiceResponseSchema,
) {}
