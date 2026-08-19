import {
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import {
  addAuthenticatedPolicy,
  addDeletedAtPolicies,
  baseEntity,
} from './base';
import { customerEntity } from './person.entities';
import { catalogItemEntity } from './catalog-item.entities';

export const customerFollowupEntity = pgTable.withRLS(
  'customer_followup',
  {
    ...baseEntity('cfup'),
    text: text('text').notNull(),
    customerId: varchar('customer_id', { length: 38 })
      .notNull()
      .references(() => customerEntity.id),
    date: timestamp('date').notNull(),
  },
  (t) => [
    index()
      .on(t.tenantId, t.customerId)
      .where(sql`${t.isDeleted} = false`),
    addAuthenticatedPolicy(t),
    ...addDeletedAtPolicies(t),
  ],
);

export const followupItemEntity = pgTable.withRLS(
  'followup_item',
  {
    ...baseEntity('cfupi'),
    followupId: varchar('followup_id', { length: 38 })
      .notNull()
      .references(() => customerFollowupEntity.id),
    catalogItemId: varchar('catalog_item_id', { length: 38 }).references(
      () => catalogItemEntity.id,
    ),
    description: varchar('description', { length: 2048 }).notNull(),
    priceApplied: numeric('price_applied', {
      precision: 10,
      scale: 2,
    }).notNull(),
    quantity: integer('quantity').notNull(),
  },
  (t) => [
    index()
      .on(t.tenantId, t.followupId)
      .where(sql`${t.isDeleted} = false`),
    index()
      .on(t.tenantId, t.catalogItemId)
      .where(sql`${t.isDeleted} = false`),
    addAuthenticatedPolicy(t),
    ...addDeletedAtPolicies(t),
  ],
);
