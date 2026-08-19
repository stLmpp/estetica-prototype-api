import { createZodDto } from '@stlmpp/nestjs-zod';
import { RequestPaginatedSchema } from '../../../../shared/model/request.model';

export const FilterCustomerAnamnesisSchema = RequestPaginatedSchema;

export class FilterCustomerAnamnesisDto extends createZodDto(
  FilterCustomerAnamnesisSchema,
  { type: 'output' },
) {}
