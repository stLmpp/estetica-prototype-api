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
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

const baseEntity = {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
};

export const customerEntity = pgTable(
  'customer',
  {
    ...baseEntity,
    name: varchar('name', { length: 255 }).notNull(),
    birthDate: date('birth_date'),
    address: varchar('address', { length: 255 }),
    zipCode: varchar('zip_code', { length: 255 }),
    neighborhood: varchar('neighborhood', { length: 255 }),
    city: varchar('city', { length: 255 }),
    state: varchar('state', { length: 255 }),
    jobName: varchar('job_name', { length: 255 }),
    maritalStatus: varchar('marital_status', { length: 255 }),
    email: varchar('email', { length: 255 }),
  },
  (t) => [
    index().on(t.email),
    index('customer_name_trgm_index').using('gin', sql`${t.name} gin_trgm_ops`),
  ],
);

export const customerPhoneEntity = pgTable(
  'customer_phone',
  {
    ...baseEntity,
    type: varchar('phone_type', { length: 255 }).notNull(),
    number: varchar('phone_number', { length: 255 }).notNull(),
    customerId: integer('customer_id')
      .notNull()
      .references(() => customerEntity.id),
  },
  (t) => [
    index().on(t.customerId),
    index().on(t.number),
  ],
);

export const catalogItemEntity = pgTable('catalog_item', {
  ...baseEntity,
  itemType: varchar('item_type', { length: 255 }).notNull(), // 'PROCEDURE' ou 'PRODUCT'
  name: varchar('name', { length: 255 }).notNull(),
  defaultPrice: numeric('default_price', { precision: 10, scale: 2 }),
  active: boolean('active').notNull(),
});

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
  (t) => [t.customerId],
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
    description: varchar('description', { length: 255 }).notNull(),
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

export const anamneseFieldEntity = pgTable('anamnese_field', {
  ...baseEntity,
  fieldType: varchar('field_type', { length: 255 }).notNull(),
  label: varchar('label', { length: 255 }).notNull(),
  extraLabels: json('extra_labels'),
  active: boolean('active').notNull(),
  displayOrder: integer('display_order').notNull(),
});

export const anamneseFieldValidationEntity = pgTable(
  'anamnese_field_validation',
  {
    ...baseEntity,
    validationType: varchar('validation_type', { length: 255 }).notNull(),
    validationArgs: json('validation_args').notNull(),
    anamneseFieldId: integer('anamnese_field_id')
      .notNull()
      .references(() => anamneseFieldEntity.id),
    active: boolean('active').notNull(),
  },
  (t) => [index().on(t.anamneseFieldId)],
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
  (t) => [index().on(t.customerId)],
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
    value: varchar('value', { length: 255 }).notNull(),
    extraValues: json('extra_values'),
  },
  (t) => [index().on(t.customerAnamneseId), index().on(t.anamneseFieldId)],
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
