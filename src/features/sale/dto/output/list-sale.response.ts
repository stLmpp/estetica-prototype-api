import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { SaleStatus } from '../../../../shared/domain/sale-status.enum';
import { createPaginatedResponseSchema } from '../../../../shared/model/response.model';
import { DatetimeSchema } from '../../../../shared/model/common.model';

const MonetaryAmountSchema = z
  .string()
  .trim()
  .regex(/^\d{1,8}(\.\d{1,2})?$/);

export const SaleSchema = z.object({
  id: z.string(),
  status: z.enum(SaleStatus),
  totalAmount: MonetaryAmountSchema,
  customerId: z.string(),
  customerName: z.string(),
  employeeId: z.string(),
  employeeName: z.string(),
  appointmentId: z.string().optional(),
  createdAt: DatetimeSchema,
});

export const ListSaleResponseSchema = createPaginatedResponseSchema(SaleSchema);

export class ListSaleResponseModel extends createZodDto(
  ListSaleResponseSchema,
) {}
