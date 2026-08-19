import {
  type AnyPgColumn,
  boolean,
  pgPolicy,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { safe } from '../../../shared/utils/safe';
import { AuthDataService } from '../../../core/auth/auth-data.service';

function getUserId() {
  const [error, userId] = safe(() => AuthDataService.instance.getUserId());
  if (error) {
    console.warn('Failed to retrieve user ID from session', error);
  }
  return userId ?? 'unknown';
}

function getTenantId() {
  const [error, tenantId] = safe(() => AuthDataService.instance.getTenantId());
  if (error) {
    console.warn('Failed to retrieve tenant ID from session', error);
    throw error;
  }
  return tenantId;
}

export function addAuthenticatedPolicy(table: { tenantId: AnyPgColumn }) {
  return pgPolicy('tenancy', {
    for: 'all',
    using: sql`${table.tenantId} = current_setting('tenant.id')`,
    withCheck: sql`${table.tenantId} = current_setting('tenant.id')`,
  });
}

export function addDeletedAtPolicies(table: {
  deletedAt: AnyPgColumn;
  isDeleted: AnyPgColumn;
}) {
  return [
    pgPolicy('deleted_write_policy', {
      as: 'restrictive',
      for: 'update',
      using: sql`${table.isDeleted} = false`,
      withCheck: sql`${table.isDeleted} = false`,
    }),
    pgPolicy('deleted_delete_policy', {
      as: 'restrictive',
      for: 'delete',
      using: sql`false`,
    }),
    pgPolicy('deleted_read_policy', {
      as: 'restrictive',
      for: 'select',
      using: sql`${table.isDeleted} = false`,
    }),
  ];
}

const baseEntityWithoutIdAndTenant = {
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
  isDeleted: boolean('is_deleted').default(false),
  createdBy: varchar('created_by', { length: 64 }).$default(() => getUserId()),
  lastUpdatedBy: varchar('last_updated_by', { length: 64 })
    .$default(() => getUserId())
    .$onUpdate(() => getUserId()),
};

const baseEntityWithoutId = {
  ...baseEntityWithoutIdAndTenant,
  tenantId: varchar('tenant_id', { length: 64 })
    .notNull()
    .$defaultFn(() => getTenantId()),
};

export function baseEntity(prefix: string) {
  if (prefix.length < 3 || prefix.length > 5) {
    throw new Error('Prefix must be between 3 and 5 characters long');
  }
  return {
    id: varchar('id', { length: 38 })
      .primaryKey()
      .default(sql`prefixed_uuid('${sql.raw(prefix)}'::text)`),
    ...baseEntityWithoutId,
  };
}
