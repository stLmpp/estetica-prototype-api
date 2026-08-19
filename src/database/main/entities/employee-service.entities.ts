import { index, pgTable, uniqueIndex, varchar } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import {
  addAuthenticatedPolicy,
  addDeletedAtPolicies,
  baseEntity,
} from './base';
import { employeeEntity } from './person.entities';
import { catalogItemEntity } from './catalog-item.entities';

export const employeeServiceEntity = pgTable.withRLS(
  'employee_service',
  {
    ...baseEntity('esvc'),
    employeeId: varchar('employee_id', { length: 38 })
      .references(() => employeeEntity.id)
      .notNull(),
    catalogItemId: varchar('catalog_item_id', { length: 38 })
      .references(() => catalogItemEntity.id)
      .notNull(),
  },
  (t) => [
    index()
      .on(t.tenantId, t.catalogItemId)
      .where(sql`${t.isDeleted} = false`),
    uniqueIndex()
      .on(t.tenantId, t.employeeId, t.catalogItemId)
      .where(sql`${t.isDeleted} = false`),
    addAuthenticatedPolicy(t),
    ...addDeletedAtPolicies(t),
  ],
);
