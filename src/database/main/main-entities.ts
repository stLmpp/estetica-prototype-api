import {
  type AnyPgColumn,
  boolean,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgPolicy,
  pgTable,
  text,
  timestamp,
  unique,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { MaritalStatus } from '../../shared/domain/marital-status.enum';
import { PhoneType } from '../../shared/domain/phone-type.enum';
import { CatalogItemType } from '../../shared/domain/catalog-item-type.enum';
import { AnamnesisFieldType } from '../../shared/domain/anamnesis-field.type';
import { AnamnesisFieldValidationType } from '../../shared/domain/anamnesis-field-validation.enum';
import { AppointmentStatus } from '../../shared/domain/appointment-staus.enum';
import { ClsServiceManager } from 'nestjs-cls';
import { safe } from '../../shared/utils/safe';
import {
  CLS_TENANT_ID_KEY,
  CLS_USER_ID_KEY,
  RLS_ROLE,
} from '../../auth/constants';
import { ConfigType } from '../../shared/domain/config-type.enum';

function getUserId() {
  const [error, userId] = safe(() => {
    const clsService = ClsServiceManager.getClsService();
    const userId: string = clsService.get(CLS_USER_ID_KEY);
    return userId;
  });
  if (error) {
    console.warn('Failed to retrieve user ID from session', error);
  }
  return userId ?? 'unknown';
}

function getTenantId() {
  const [error, tenantId] = safe(() => {
    const clsService = ClsServiceManager.getClsService();
    const tenantId: string = clsService.get(CLS_TENANT_ID_KEY);
    return tenantId;
  });
  if (error) {
    console.warn('Failed to retrieve tenant ID from session', error);
    throw error;
  }
  return tenantId;
}

function addAuthenticatedPolicy(table: { tenantId: AnyPgColumn }) {
  return pgPolicy('tenancy', {
    for: 'all',
    using: sql`${table.tenantId} = current_setting('tenant.id')`,
    withCheck: sql`${table.tenantId} = current_setting('tenant.id')`,
  });
}

function addDeletedAtPolicy(table: { deletedAt: AnyPgColumn }) {
  return pgPolicy('deleted_at', {
    for: 'all',
    to: RLS_ROLE,
    using: sql`${table.deletedAt} IS NULL`,
    withCheck: sql`true`,
  });
}

const baseEntityWithoutId = {
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
  createdBy: varchar('created_by', { length: 64 }).$default(() => getUserId()),
  lastUpdatedBy: varchar('last_updated_by', { length: 64 })
    .$default(() => getUserId())
    .$onUpdate(() => getUserId()),
  tenantId: varchar('tenant_id', { length: 64 })
    .notNull()
    .$defaultFn(() => getTenantId()),
};

function baseEntity(prefix: string) {
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

export const maritalStatus = pgEnum('marital_status', MaritalStatus);

export const personEntity = pgTable(
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
      .where(sql`${t.deletedAt} IS NULL`),
    index('customer_name_trgm_index')
      .using('gin', sql`${t.name} gin_trgm_ops`)
      .where(sql`${t.deletedAt} IS NULL`),
    addAuthenticatedPolicy(t),
    addDeletedAtPolicy(t),
  ],
);

export const employeeEntity = pgTable(
  'employee',
  {
    ...baseEntity('emp'),
    personId: varchar('person_id', { length: 38 })
      .notNull()
      .references(() => personEntity.id),
    role: varchar('role', { length: 256 }).notNull(),
  },
  (t) => [
    index()
      .on(t.tenantId, t.personId)
      .where(sql`${t.deletedAt} IS NULL`),
    addAuthenticatedPolicy(t),
    addDeletedAtPolicy(t),
  ],
);

export const customerEntity = pgTable(
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
      .where(sql`${t.deletedAt} IS NULL`),
    addAuthenticatedPolicy(t),
    addDeletedAtPolicy(t),
  ],
);

export const phoneType = pgEnum('phone_type', PhoneType);

export const personPhoneEntity = pgTable(
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
      .where(sql`${t.deletedAt} IS NULL`),
    index()
      .on(t.tenantId, t.number)
      .where(sql`${t.deletedAt} IS NULL`),
    addAuthenticatedPolicy(t),
    addDeletedAtPolicy(t),
  ],
);

export const catalogItemType = pgEnum('catalog_item_type', CatalogItemType);

export const catalogItemEntity = pgTable(
  'catalog_item',
  {
    ...baseEntity('citm'),
    itemType: catalogItemType('item_type').notNull(),
    name: varchar('name', { length: 256 }).notNull(),
    defaultPrice: numeric('default_price', { precision: 10, scale: 2 }),
    active: boolean('active').notNull(),
  },
  (t) => [
    index()
      .on(t.tenantId, t.itemType)
      .where(sql`${t.deletedAt} IS NULL`),
    addAuthenticatedPolicy(t),
    addDeletedAtPolicy(t),
  ],
);

export const customerFollowupEntity = pgTable(
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
      .where(sql`${t.deletedAt} IS NULL`),
    addAuthenticatedPolicy(t),
    addDeletedAtPolicy(t),
  ],
);

export const followupItemEntity = pgTable(
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
      .where(sql`${t.deletedAt} IS NULL`),
    index()
      .on(t.tenantId, t.catalogItemId)
      .where(sql`${t.deletedAt} IS NULL`),
    addAuthenticatedPolicy(t),
    addDeletedAtPolicy(t),
  ],
);

export const anamnesisFieldType = pgEnum(
  'anamnesis_field_type',
  AnamnesisFieldType,
);

export const anamnesisFieldEntity = pgTable(
  'anamnesis_field',
  {
    ...baseEntity('anf'),
    fieldType: anamnesisFieldType('field_type').notNull(),
    fieldArgs: jsonb('field_args'),
    label: varchar('label', { length: 128 }).notNull(),
    extraLabels: jsonb('extra_labels'),
    active: boolean('active').notNull(),
    displayOrder: integer('display_order').notNull(),
  },
  (t) => [
    addAuthenticatedPolicy(t),
    addDeletedAtPolicy(t),
  ],
);

export const anamnesisFieldValidationType = pgEnum(
  'anamnesis_field_validation_type',
  AnamnesisFieldValidationType,
);

export const anamnesisFieldValidationEntity = pgTable(
  'anamnesis_field_validation',
  {
    ...baseEntity('anfv'),
    validationType: anamnesisFieldValidationType('validation_type').notNull(),
    validationArgs: jsonb('validation_args'),
    anamnesisFieldId: varchar('anamnesis_field_id', { length: 38 })
      .notNull()
      .references(() => anamnesisFieldEntity.id),
    active: boolean('active').notNull(),
  },
  (t) => [
    index()
      .on(t.tenantId, t.anamnesisFieldId)
      .where(sql`${t.deletedAt} IS NULL`),
    addAuthenticatedPolicy(t),
    addDeletedAtPolicy(t),
  ],
);

export const customerAnamnesisEntity = pgTable(
  'customer_anamnesis',
  {
    ...baseEntity('canm'),
    customerId: varchar('customer_id', { length: 38 })
      .notNull()
      .references(() => customerEntity.id),
    date: timestamp('date').notNull(),
  },
  (t) => [
    index()
      .on(t.tenantId, t.customerId)
      .where(sql`${t.deletedAt} IS NULL`),
    addAuthenticatedPolicy(t),
    addDeletedAtPolicy(t),
  ],
);

export const customerAnamnesisFieldEntity = pgTable(
  'customer_anamnesis_field',
  {
    ...baseEntity('canmf'),
    customerAnamnesisId: varchar('customer_anamnesis_id', { length: 38 })
      .notNull()
      .references(() => customerAnamnesisEntity.id),
    anamnesisFieldId: varchar('anamnesis_field_id', { length: 38 })
      .notNull()
      .references(() => anamnesisFieldEntity.id),
    value: varchar('value', { length: 2048 }).notNull(),
    extraValues: jsonb('extra_values'),
  },
  (t) => [
    index()
      .on(t.tenantId, t.customerAnamnesisId)
      .where(sql`${t.deletedAt} IS NULL`),
    index()
      .on(t.tenantId, t.anamnesisFieldId)
      .where(sql`${t.deletedAt} IS NULL`),
    addAuthenticatedPolicy(t),
    addDeletedAtPolicy(t),
  ],
);

export const appointmentStatusEnum = pgEnum(
  'appointment_status',
  AppointmentStatus,
);

export const appointmentEntity = pgTable(
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
      .where(sql`${t.deletedAt} IS NULL`),
    index()
      .on(t.tenantId, t.employeeId)
      .where(sql`${t.deletedAt} IS NULL`),
    index()
      .on(t.tenantId, t.startTime)
      .where(sql`${t.deletedAt} IS NULL`),
    addAuthenticatedPolicy(t),
    addDeletedAtPolicy(t),
  ],
);

export const appointmentItemEntity = pgTable(
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
    }),
  },
  (t) => [
    index()
      .on(t.tenantId, t.appointmentId)
      .where(sql`${t.deletedAt} IS NULL`),
    index()
      .on(t.tenantId, t.catalogItemId)
      .where(sql`${t.deletedAt} IS NULL`),
    addAuthenticatedPolicy(t),
    addDeletedAtPolicy(t),
  ],
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
  },
  (t) => [
    uniqueIndex()
      .on(t.group, t.tenantId, t.userId, t.name, t.version)
      .where(sql`${t.deletedAt} IS NULL`),
    index()
      .on(t.group, t.tenantId, t.userId, t.name)
      .where(sql`${t.deletedAt} IS NULL`),
    index()
      .on(t.group, t.tenantId, t.userId)
      .where(sql`${t.deletedAt} IS NULL`),
    addDeletedAtPolicy(t),
  ],
);

export const authAccountEntity = pgTable(
  'auth_account',
  {
    id: text().primaryKey(),
    accountId: text().notNull(),
    providerId: text().notNull(),
    userId: text()
      .notNull()
      .references(() => authUserEntity.id, { onDelete: 'cascade' }),
    accessToken: text(),
    refreshToken: text(),
    idToken: text(),
    accessTokenExpiresAt: timestamp({ withTimezone: true }),
    refreshTokenExpiresAt: timestamp({ withTimezone: true }),
    scope: text(),
    password: text(),
    createdAt: timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ withTimezone: true }).notNull(),
  },
  (table) => [
    index('auth_account_userId_idx').using(
      'btree',
      table.userId.asc().nullsLast(),
    ),
  ],
);

export const authInvitationEntity = pgTable(
  'auth_invitation',
  {
    id: text().primaryKey(),
    organizationId: text()
      .notNull()
      .references(() => authOrganizationEntity.id, { onDelete: 'cascade' }),
    email: text().notNull(),
    role: text(),
    status: text().notNull(),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    createdAt: timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    inviterId: text()
      .notNull()
      .references(() => authUserEntity.id, { onDelete: 'cascade' }),
  },
  (table) => [
    index('auth_invitation_email_idx').using(
      'btree',
      table.email.asc().nullsLast(),
    ),
    index('auth_invitation_organizationId_idx').using(
      'btree',
      table.organizationId.asc().nullsLast(),
    ),
  ],
);

export const authMemberEntity = pgTable(
  'auth_member',
  {
    id: text().primaryKey(),
    organizationId: text()
      .notNull()
      .references(() => authOrganizationEntity.id, { onDelete: 'cascade' }),
    userId: text()
      .notNull()
      .references(() => authUserEntity.id, { onDelete: 'cascade' }),
    role: text().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull(),
  },
  (table) => [
    index('auth_member_organizationId_idx').using(
      'btree',
      table.organizationId.asc().nullsLast(),
    ),
    index('auth_member_userId_idx').using(
      'btree',
      table.userId.asc().nullsLast(),
    ),
  ],
);

export const authOrganizationEntity = pgTable(
  'auth_organization',
  {
    id: text().primaryKey(),
    name: text().notNull(),
    slug: text().notNull(),
    logo: text(),
    createdAt: timestamp({ withTimezone: true }).notNull(),
    metadata: text(),
    membershipLimit: integer('membership_limit').notNull(),
  },
  (table) => [
    unique('auth_organization_slug_key').on(table.slug),
  ],
);

export const authUserEntity = pgTable(
  'auth_user',
  {
    id: text().primaryKey(),
    name: text().notNull(),
    email: text().notNull(),
    emailVerified: boolean().notNull(),
    image: text(),
    createdAt: timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    role: text(),
    banned: boolean(),
    banReason: text(),
    banExpires: timestamp({ withTimezone: true }),
  },
  (table) => [
    unique('auth_user_email_key').on(table.email),
  ],
);

export const mainEntities = {
  person: personEntity,
  employee: employeeEntity,
  customer: customerEntity,
  personPhone: personPhoneEntity,
  catalogItem: catalogItemEntity,
  customerFollowup: customerFollowupEntity,
  followupItem: followupItemEntity,
  anamnesisField: anamnesisFieldEntity,
  anamnesisFieldValidation: anamnesisFieldValidationEntity,
  customerAnamnesis: customerAnamnesisEntity,
  customerAnamnesisField: customerAnamnesisFieldEntity,
  appointment: appointmentEntity,
  appointmentItem: appointmentItemEntity,
  config: configEntity,
  authAccount: authAccountEntity,
  authInvitation: authInvitationEntity,
  authMember: authMemberEntity,
  authOrganization: authOrganizationEntity,
  authUser: authUserEntity,
};
