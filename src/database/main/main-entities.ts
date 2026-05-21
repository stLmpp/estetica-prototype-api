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
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { MaritalStatus } from '../../shared/domain/marital-status.enum';
import { PhoneType } from '../../shared/domain/phone-type.enum';
import { CatalogItemType } from '../../shared/domain/catalog-item-type.enum';
import { AnamneseFieldType } from '../../shared/domain/anamnese-field.type';
import { AnamneseFieldValidationType } from '../../shared/domain/anamnese-field-validation.type';

const baseEntity = {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
};

export const maritalStatus = pgEnum('marital_status', MaritalStatus);

export const customerEntity = pgTable(
  'customer',
  {
    ...baseEntity,
    name: varchar('name', { length: 1024 }).notNull(),
    birthDate: date('birth_date', { mode: 'date' }),
    address: varchar('address', { length: 1024 }),
    zipCode: varchar('zip_code', { length: 10 }),
    neighborhood: varchar('neighborhood', { length: 256 }),
    city: varchar('city', { length: 256 }),
    state: varchar('state', { length: 256 }),
    jobName: varchar('job_name', { length: 256 }),
    maritalStatus: maritalStatus('marital_status'),
    email: varchar('email', { length: 1024 }),
  },
  (t) => [
    index().on(t.email),
    index('customer_name_trgm_index').using('gin', sql`${t.name} gin_trgm_ops`),
  ],
);

export const phoneType = pgEnum('phone_type', PhoneType);

export const customerPhoneEntity = pgTable(
  'customer_phone',
  {
    ...baseEntity,
    type: phoneType().notNull(),
    number: varchar('phone_number', { length: 12 }).notNull(),
    customerId: integer('customer_id')
      .notNull()
      .references(() => customerEntity.id),
  },
  (t) => [
    index().on(t.customerId),
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
    customerId: integer('customer_id')
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
    followupId: integer('followup_id')
      .notNull()
      .references(() => customerFollowupEntity.id),
    catalogItemId: integer('catalog_item_id').references(
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
    anamneseFieldId: integer('anamnese_field_id')
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
    customerId: integer('customer_id')
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
    customerAnamneseId: integer('customer_anamnese_id')
      .notNull()
      .references(() => customerAnamneseEntity.id),
    anamneseFieldId: integer('anamnese_field_id')
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

export const mainEntities = {
  customer: customerEntity,
  customerPhone: customerPhoneEntity,
  catalogItem: catalogItemEntity,
  customerFollowup: customerFollowupEntity,
  followupItem: followupItemEntity,
  anamneseField: anamneseFieldEntity,
  anamneseFieldValidation: anamneseFieldValidationEntity,
  customerAnamnese: customerAnamneseEntity,
  customerAnamneseField: customerAnamneseFieldEntity,
};
