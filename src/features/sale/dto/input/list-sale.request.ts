import { z } from 'zod';
import { createZodDto } from '@stlmpp/nestjs-zod';
import { RequestPaginatedSchema } from '../../../../shared/model/request.model';
import { DatetimeParamSchema } from '../../../../shared/model/common.model';
import { SaleStatus } from '../../../../shared/domain/sale-status.enum';

export const FilterSaleSchema = RequestPaginatedSchema.extend({
  customerId: z.string().trim().min(1).optional(),
  employeeId: z.string().trim().min(1).optional(),
  appointmentId: z.string().trim().min(1).optional(),
  status: z.enum(SaleStatus).optional(),
  from: DatetimeParamSchema.optional(),
  to: DatetimeParamSchema.optional(),
});

export class FilterSaleDto extends createZodDto(FilterSaleSchema, {
  type: 'output',
}) {}
