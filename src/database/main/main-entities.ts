import {
  pgTable,
  integer,
  varchar,
  date,
  boolean,
  numeric,
  text,
  timestamp,
  json,
  index,
  pgEnum,
  bigint as pgCoreBigint,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { MaritalStatus } from '../../shared/domain/marital-status.enum';
import { PhoneType } from '../../shared/domain/phone-type.enum';
import { CatalogItemType } from '../../shared/domain/catalog-item-type.enum';
import { AnamneseFieldType } from '../../shared/domain/anamnese-field.type';
import { AnamneseFieldValidationType } from '../../shared/domain/anamnese-field-validation.type';
import { AppointmentStatus } from '../../shared/domain/appointment-staus.enum';

function bigint(name: string): ReturnType<typeof pgCoreBigint<'number'>> {
  return pgCoreBigint(name, { mode: 'number' });
}

const baseEntityWithoutId = {
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
  createdBy: bigint('created_by'), // TODO figure out how to do this
  lastUpdatedBy: bigint('last_updated_by'), // TODO figure out how to do this
};

const baseEntity = {
  id: bigint('id').primaryKey().generatedAlwaysAsIdentity(),
  ...baseEntityWithoutId,
};

export const maritalStatus = pgEnum('marital_status', MaritalStatus);

export const personEntity = pgTable(
  'person',
  {
    ...baseEntity,
    name: varchar('name', { length: 1024 }).notNull(),
    birthDate: date('birth_date', { mode: 'date' }),
    address: varchar('address', { length: 1024 }),
    zipCode: varchar('zip_code', { length: 10 }),
    neighborhood: varchar('neighborhood', { length: 256 }),
    city: varchar('city', { length: 256 }),
    state: varchar('state', { length: 256 }),
    maritalStatus: maritalStatus('marital_status'),
    email: varchar('email', { length: 1024 }),
    userId: text('user_id'), // TODO figure out how to do this
  },
  (t) => [
    index().on(t.email),
    index('customer_name_trgm_index').using('gin', sql`${t.name} gin_trgm_ops`),
  ],
);

export const employeeEntity = pgTable(
  'employee',
  {
    ...baseEntity,
    personId: bigint('person_id')
      .notNull()
      .references(() => personEntity.id),
    role: varchar('role', { length: 256 }).notNull(),
  },
  (t) => [index().on(t.personId)],
);

export const customerEntity = pgTable(
  'customer',
  {
    ...baseEntity,
    personId: bigint('person_id')
      .notNull()
      .references(() => personEntity.id),
    jobName: varchar('job_name', { length: 256 }),
  },
  (t) => [
    index().on(t.personId),
  ],
);

export const phoneType = pgEnum('phone_type', PhoneType);

export const personPhoneEntity = pgTable(
  'person_phone',
  {
    ...baseEntity,
    type: phoneType().notNull(),
    number: varchar('phone_number', { length: 12 }).notNull(),
    personId: bigint('person_id')
      .notNull()
      .references(() => personEntity.id),
  },
  (t) => [
    index().on(t.personId),
    index().on(t.number),
  ],
);

export const catalogItemType = pgEnum('catalog_item_type', CatalogItemType);

export const catalogItemEntity = pgTable(
  'catalog_item',
  {
    ...baseEntity,
    itemType: catalogItemType('item_type').notNull(),
    name: varchar('name', { length: 256 }).notNull(),
    defaultPrice: numeric('default_price', { precision: 10, scale: 2 }),
    active: boolean('active').notNull(),
  },
  (t) => [
    index().on(t.itemType),
  ],
);

export const customerFollowupEntity = pgTable(
  'customer_followup',
  {
    ...baseEntity,
    text: text('text').notNull(),
    customerId: bigint('customer_id')
      .notNull()
      .references(() => customerEntity.id),
    date: timestamp('date').notNull(),
  },
  (t) => [
    index().on(t.customerId),
  ],
);

export const followupItemEntity = pgTable(
  'followup_item',
  {
    ...baseEntity,
    followupId: bigint('followup_id')
      .notNull()
      .references(() => customerFollowupEntity.id),
    catalogItemId: bigint('catalog_item_id').references(
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
    index().on(t.followupId),
    index().on(t.catalogItemId),
  ],
);

export const anamneseFieldType = pgEnum(
  'anamnese_field_type',
  AnamneseFieldType,
);

export const anamneseFieldEntity = pgTable('anamnese_field', {
  ...baseEntity,
  fieldType: anamneseFieldType('field_type').notNull(),
  fieldArgs: json('field_args'),
  label: varchar('label', { length: 128 }).notNull(),
  extraLabels: json('extra_labels'),
  active: boolean('active').notNull(),
  displayOrder: integer('display_order').notNull(),
});

export const anamneseFieldValidationType = pgEnum(
  'anamnese_field_validation_type',
  AnamneseFieldValidationType,
);

export const anamneseFieldValidationEntity = pgTable(
  'anamnese_field_validation',
  {
    ...baseEntity,
    validationType: anamneseFieldValidationType('validation_type').notNull(),
    validationArgs: json('validation_args'),
    anamneseFieldId: bigint('anamnese_field_id')
      .notNull()
      .references(() => anamneseFieldEntity.id),
    active: boolean('active').notNull(),
  },
  (t) => [
    index().on(t.anamneseFieldId),
  ],
);

export const customerAnamneseEntity = pgTable(
  'customer_anamnese',
  {
    ...baseEntity,
    customerId: bigint('customer_id')
      .notNull()
      .references(() => customerEntity.id),
    date: timestamp('date').notNull(),
  },
  (t) => [
    index().on(t.customerId),
  ],
);

export const customerAnamneseFieldEntity = pgTable(
  'customer_anamnese_field',
  {
    ...baseEntity,
    customerAnamneseId: bigint('customer_anamnese_id')
      .notNull()
      .references(() => customerAnamneseEntity.id),
    anamneseFieldId: bigint('anamnese_field_id')
      .notNull()
      .references(() => anamneseFieldEntity.id),
    value: varchar('value', { length: 2048 }).notNull(),
    extraValues: json('extra_values'),
  },
  (t) => [
    index().on(t.customerAnamneseId),
    index().on(t.anamneseFieldId),
  ],
);

export const appointmentStatusEnum = pgEnum(
  'appointment_status',
  AppointmentStatus,
);

export const appointmentEntity = pgTable(
  'appointment',
  {
    ...baseEntity,
    customerId: bigint('customer_id')
      .notNull()
      .references(() => customerEntity.id),
    employeeId: bigint('employee_id')
      .notNull()
      .references(() => employeeEntity.id),
    startTime: timestamp('start_time').notNull(),
    endTime: timestamp('end_time').notNull(),
    status: appointmentStatusEnum('status').notNull(),
    notes: varchar('notes', { length: 2048 }),
  },
  (t) => [
    index().on(t.customerId),
    index().on(t.employeeId),
    index().on(t.startTime),
  ],
);

export const appointmentItemEntity = pgTable(
  'appointment_item',
  {
    ...baseEntity,
    appointmentId: bigint('appointment_id')
      .notNull()
      .references(() => appointmentEntity.id),
    catalogItemId: bigint('catalog_item_id')
      .notNull()
      .references(() => catalogItemEntity.id),
    quantity: integer('quantity').default(1).notNull(),
    priceApplied: numeric('price_applied', {
      precision: 10,
      scale: 2,
    }),
  },
  (t) => [
    index().on(t.appointmentId),
    index().on(t.catalogItemId),
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
  anamneseField: anamneseFieldEntity,
  anamneseFieldValidation: anamneseFieldValidationEntity,
  customerAnamnese: customerAnamneseEntity,
  customerAnamneseField: customerAnamneseFieldEntity,
  appointment: appointmentEntity,
  appointmentItem: appointmentItemEntity,
};
