import {
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { AppointmentStatus } from '../../../shared/domain/appointment-staus.enum';
import {
  addAuthenticatedPolicy,
  addDeletedAtPolicies,
  baseEntity,
} from './base';
import { customerEntity, employeeEntity } from './person.entities';
import { catalogItemEntity } from './catalog-item.entities';

export const appointmentStatusEnum = pgEnum(
  'appointment_status',
  AppointmentStatus,
);

export const appointmentEntity = pgTable.withRLS(
  'appointment',
  {
    ...baseEntity('apt'),
    customerId: varchar('customer_id', { length: 38 })
      .notNull()
      .references(() => customerEntity.id),
    employeeId: varchar('employee_id', { length: 38 })
      .notNull()
      .references(() => employeeEntity.id),
    startTime: timestamp('start_time').notNull(),
    endTime: timestamp('end_time').notNull(),
    status: appointmentStatusEnum('status').notNull(),
    notes: varchar('notes', { length: 2048 }),
  },
  (t) => [
    index()
      .on(t.tenantId, t.customerId)
      .where(sql`${t.isDeleted} = false`),
    index()
      .on(t.tenantId, t.employeeId)
      .where(sql`${t.isDeleted} = false`),
    index()
      .on(t.tenantId, t.startTime)
      .where(sql`${t.isDeleted} = false`),
    addAuthenticatedPolicy(t),
    ...addDeletedAtPolicies(t),
  ],
);

export const appointmentItemEntity = pgTable.withRLS(
  'appointment_item',
  {
    ...baseEntity('apti'),
    appointmentId: varchar('appointment_id', { length: 38 })
      .notNull()
      .references(() => appointmentEntity.id),
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
      .on(t.tenantId, t.appointmentId)
      .where(sql`${t.isDeleted} = false`),
    index()
      .on(t.tenantId, t.catalogItemId)
      .where(sql`${t.isDeleted} = false`),
    addAuthenticatedPolicy(t),
    ...addDeletedAtPolicies(t),
  ],
);
