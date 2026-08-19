import {
  boolean,
  index,
  numeric,
  pgEnum,
  pgTable,
  varchar,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { CatalogItemType } from '../../../shared/domain/catalog-item-type.enum';
import {
  addAuthenticatedPolicy,
  addDeletedAtPolicies,
  baseEntity,
} from './base';

export const catalogItemType = pgEnum('catalog_item_type', CatalogItemType);

export const catalogItemEntity = pgTable.withRLS(
  'catalog_item',
  {
    ...baseEntity('citm'),
    itemType: catalogItemType('item_type').notNull(),
    name: varchar('name', { length: 256 }).notNull(),
    defaultPrice: numeric('default_price', {
      precision: 10,
      scale: 2,
    }),
    defaultDuration: varchar('default_duration', { length: 32 }),
    active: boolean('active').notNull(),
  },
  (t) => [
    index()
      .on(t.tenantId, t.itemType)
      .where(sql`${t.isDeleted} = false`),
    addAuthenticatedPolicy(t),
    ...addDeletedAtPolicies(t),
  ],
);
