import {
  date,
  index,
  jsonb,
  pgEnum,
  pgTable,
  varchar,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { MaritalStatus } from '../../../shared/domain/marital-status.enum';
import { PhoneType } from '../../../shared/domain/phone-type.enum';
import { type WeeklyWorkingHours } from '../../../shared/model/working-hours.model';
import {
  addAuthenticatedPolicy,
  addDeletedAtPolicies,
  baseEntity,
} from './base';

export const maritalStatus = pgEnum('marital_status', MaritalStatus);

export const personEntity = pgTable.withRLS(
  'person',
  {
    ...baseEntity('per'),
    name: varchar('name', { length: 1024 }).notNull(),
    birthDate: date('birth_date', { mode: 'date' }),
    address: varchar('address', { length: 1024 }),
    zipCode: varchar('zip_code', { length: 10 }),
    neighborhood: varchar('neighborhood', { length: 256 }),
    city: varchar('city', { length: 256 }),
    state: varchar('state', { length: 256 }),
    maritalStatus: maritalStatus('marital_status'),
    email: varchar('email', { length: 1024 }),
    userId: varchar('user_id', { length: 64 }),
  },
  (t) => [
    index()
      .on(t.tenantId, t.email)
      .where(sql`${t.isDeleted} = false`),
    index('customer_name_trgm_index')
      .using('gin', sql`${t.name} gin_trgm_ops`)
      .where(sql`${t.isDeleted} = false`),
    addAuthenticatedPolicy(t),
    ...addDeletedAtPolicies(t),
  ],
);

export const employeeEntity = pgTable.withRLS(
  'employee',
  {
    ...baseEntity('emp'),
    personId: varchar('person_id', { length: 38 })
      .notNull()
      .references(() => personEntity.id),
    role: varchar('role', { length: 256 }).notNull(),
    workingHours: jsonb('working_hours').$type<WeeklyWorkingHours>(),
  },
  (t) => [
    index()
      .on(t.tenantId, t.personId)
      .where(sql`${t.isDeleted} = false`),
    addAuthenticatedPolicy(t),
    ...addDeletedAtPolicies(t),
  ],
);

export const customerEntity = pgTable.withRLS(
  'customer',
  {
    ...baseEntity('cus'),
    personId: varchar('person_id', { length: 38 })
      .notNull()
      .references(() => personEntity.id),
    jobName: varchar('job_name', { length: 256 }),
  },
  (t) => [
    index()
      .on(t.tenantId, t.personId)
      .where(sql`${t.isDeleted} = false`),
    addAuthenticatedPolicy(t),
    ...addDeletedAtPolicies(t),
  ],
);

export const phoneType = pgEnum('phone_type', PhoneType);

export const personPhoneEntity = pgTable.withRLS(
  'person_phone',
  {
    ...baseEntity('phon'),
    type: phoneType().notNull(),
    number: varchar('phone_number', { length: 12 }).notNull(),
    personId: varchar('person_id', { length: 38 })
      .notNull()
      .references(() => personEntity.id),
  },
  (t) => [
    index()
      .on(t.tenantId, t.personId)
      .where(sql`${t.isDeleted} = false`),
    index()
      .on(t.tenantId, t.number)
      .where(sql`${t.isDeleted} = false`),
    addAuthenticatedPolicy(t),
    ...addDeletedAtPolicies(t),
  ],
);
