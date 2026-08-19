import { z } from 'zod';
import { createZodDto } from '@stlmpp/nestjs-zod';
import { SaleStatus } from '../../../../shared/domain/sale-status.enum';

export const UpdateSaleStatusSchema = z.object({
  status: z.enum(SaleStatus),
});

export class UpdateSaleStatusDto extends createZodDto(UpdateSaleStatusSchema, {
  type: 'output',
}) {}

export const UpdateSaleStatusRequestSchema = z.object({
  sale: UpdateSaleStatusSchema,
});

export class UpdateSaleStatusRequest extends createZodDto(
  UpdateSaleStatusRequestSchema,
  { type: 'output' },
) {}
