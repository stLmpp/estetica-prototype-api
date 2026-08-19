import {
  integer,
  pgEnum,
  pgTable,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  varchar,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { ConfigType } from '../../../shared/domain/config-type.enum';
import { SecurityLevelType } from '../../../shared/domain/security-level-type.enum';
import { baseEntity } from './base';

export const securityLevelType = pgEnum(
  'security_level_type',
  SecurityLevelType,
);
export const configTypeEnum = pgEnum('config_type', ConfigType);

export const configEntity = pgTable(
  'config',
  {
    ...baseEntity('cfg'),
    name: varchar('name', { length: 64 }).notNull(),
    displayName: varchar('display_name', { length: 128 }).notNull(),
    group: varchar('group', { length: 64 }).notNull(),
    description: varchar('description', { length: 2048 }),
    version: integer('version').notNull(),
    inactivatedAt: timestamp('inactivated_at'),
    userId: varchar('user_id', { length: 64 }).notNull(),
    value: text('value').notNull(),
    type: configTypeEnum('type').notNull(),
    requiredSecurityLevel: smallint('required_security_level'),
    securityLevelType: securityLevelType('security_level_type'),
  },
  (t) => [
    uniqueIndex()
      .on(t.group, t.tenantId, t.userId, t.name, t.version)
      .where(sql`${t.isDeleted} = false`),
    index()
      .on(t.group, t.tenantId, t.userId, t.name)
      .where(sql`${t.isDeleted} = false`),
    index()
      .on(t.group, t.tenantId, t.userId)
      .where(sql`${t.isDeleted} = false`),
  ],
);
