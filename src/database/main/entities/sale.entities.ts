import {
  date,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  smallint,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { SaleStatus } from '../../../shared/domain/sale-status.enum';
import { PaymentMethod } from '../../../shared/domain/payment-method.enum';
import { SaleTransactionType } from '../../../shared/domain/sale-transaction-type.enum';
import {
  addAuthenticatedPolicy,
  addDeletedAtPolicies,
  baseEntity,
} from './base';
import { customerEntity, employeeEntity } from './person.entities';
import { appointmentEntity } from './appointment.entities';
import { catalogItemEntity } from './catalog-item.entities';

export const saleStatusEnum = pgEnum('sale_status', SaleStatus);
export const paymentMethodEnum = pgEnum('payment_method', PaymentMethod);
export const saleTransactionTypeEnum = pgEnum(
  'sale_transaction_type',
  SaleTransactionType,
);

export const saleEntity = pgTable.withRLS(
  'sale',
  {
    ...baseEntity('sale'),
    customerId: varchar('customer_id', { length: 38 })
      .notNull()
      .references(() => customerEntity.id),
    employeeId: varchar('employee_id', { length: 38 })
      .notNull()
      .references(() => employeeEntity.id),
    appointmentId: varchar('appointment_id', { length: 38 }).references(
      () => appointmentEntity.id,
    ),
    status: saleStatusEnum('status').notNull(),
    totalAmount: numeric('total_amount', {
      precision: 10,
      scale: 2,
    }).notNull(),
  },
  (t) => [
    index()
      .on(t.tenantId, t.customerId)
      .where(sql`${t.isDeleted} = false`),
    index()
      .on(t.tenantId, t.employeeId)
      .where(sql`${t.isDeleted} = false`),
    index()
      .on(t.tenantId, t.appointmentId)
      .where(sql`${t.isDeleted} = false`),
    index()
      .on(t.tenantId, t.status)
      .where(sql`${t.isDeleted} = false`),
    addAuthenticatedPolicy(t),
    ...addDeletedAtPolicies(t),
  ],
);

export const saleItemEntity = pgTable.withRLS(
  'sale_item',
  {
    ...baseEntity('slit'),
    saleId: varchar('sale_id', { length: 38 })
      .notNull()
      .references(() => saleEntity.id),
    catalogItemId: varchar('catalog_item_id', { length: 38 })
      .notNull()
      .references(() => catalogItemEntity.id),
    quantity: integer('quantity').default(1).notNull(),
    priceApplied: numeric('price_applied', {
      precision: 10,
      scale: 2,
    }).notNull(),
  },
  (t) => [
    index()
      .on(t.tenantId, t.saleId)
      .where(sql`${t.isDeleted} = false`),
    index()
      .on(t.tenantId, t.catalogItemId)
      .where(sql`${t.isDeleted} = false`),
    addAuthenticatedPolicy(t),
    ...addDeletedAtPolicies(t),
  ],
);

export const saleTransactionEntity = pgTable.withRLS(
  'sale_transaction',
  {
    ...baseEntity('sltx'),
    saleId: varchar('sale_id', { length: 38 })
      .notNull()
      .references(() => saleEntity.id),
    type: saleTransactionTypeEnum('type').notNull(),
    paymentMethod: paymentMethodEnum('payment_method').notNull(),
    amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
    installmentNumber: smallint('installment_number'),
    installmentCount: smallint('installment_count'),
    dueDate: date('due_date', { mode: 'date' }),
    receivedAt: timestamp('received_at'),
  },
  (t) => [
    index()
      .on(t.tenantId, t.saleId)
      .where(sql`${t.isDeleted} = false`),
    addAuthenticatedPolicy(t),
    ...addDeletedAtPolicies(t),
  ],
);
