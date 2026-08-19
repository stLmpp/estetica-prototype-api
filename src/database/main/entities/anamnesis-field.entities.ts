import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  varchar,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import {
  AnamnesisFieldType,
  type AnamnesisFieldArgs,
  type AnamnesisFieldExtraLabels,
} from '../../../shared/domain/anamnesis-field.type';
import {
  AnamnesisFieldValidationType,
  type AnamnesisFieldValidationArgs,
} from '../../../shared/domain/anamnesis-field-validation.enum';
import {
  addAuthenticatedPolicy,
  addDeletedAtPolicies,
  baseEntity,
} from './base';

export const anamnesisFieldType = pgEnum(
  'anamnesis_field_type',
  AnamnesisFieldType,
);

export const anamnesisFormEntity = pgTable.withRLS(
  'anamnesis_form',
  {
    ...baseEntity('anfo'),
    name: varchar('name', { length: 256 }).notNull(),
    description: varchar('description', { length: 2048 }),
    active: boolean('active').notNull(),
    displayOrder: integer('display_order').notNull(),
  },
  (t) => [addAuthenticatedPolicy(t), ...addDeletedAtPolicies(t)],
);

export const anamnesisSectionEntity = pgTable.withRLS(
  'anamnesis_section',
  {
    ...baseEntity('ansc'),
    anamnesisFormId: varchar('anamnesis_form_id', { length: 38 })
      .notNull()
      .references(() => anamnesisFormEntity.id),
    label: varchar('label', { length: 128 }).notNull(),
    displayOrder: integer('display_order').notNull(),
    active: boolean('active').notNull(),
  },
  (t) => [
    index()
      .on(t.tenantId, t.anamnesisFormId)
      .where(sql`${t.isDeleted} = false`),
    addAuthenticatedPolicy(t),
    ...addDeletedAtPolicies(t),
  ],
);

export const anamnesisFieldEntity = pgTable.withRLS(
  'anamnesis_field',
  {
    ...baseEntity('anf'),
    anamnesisFormId: varchar('anamnesis_form_id', { length: 38 })
      .notNull()
      .references(() => anamnesisFormEntity.id),
    anamnesisSectionId: varchar('anamnesis_section_id', {
      length: 38,
    }).references(() => anamnesisSectionEntity.id),
    fieldType: anamnesisFieldType('field_type').notNull(),
    fieldArgs: jsonb('field_args').$type<AnamnesisFieldArgs>(),
    label: varchar('label', { length: 128 }).notNull(),
    extraLabels: jsonb('extra_labels').$type<AnamnesisFieldExtraLabels>(),
    active: boolean('active').notNull(),
    displayOrder: integer('display_order').notNull(),
  },
  (t) => [
    index()
      .on(t.tenantId, t.anamnesisFormId)
      .where(sql`${t.isDeleted} = false`),
    index()
      .on(t.tenantId, t.anamnesisSectionId)
      .where(sql`${t.isDeleted} = false`),
    addAuthenticatedPolicy(t),
    ...addDeletedAtPolicies(t),
  ],
);

export const anamnesisFieldValidationType = pgEnum(
  'anamnesis_field_validation_type',
  AnamnesisFieldValidationType,
);

export const anamnesisFieldValidationEntity = pgTable.withRLS(
  'anamnesis_field_validation',
  {
    ...baseEntity('anfv'),
    validationType: anamnesisFieldValidationType('validation_type').notNull(),
    validationArgs:
      jsonb('validation_args').$type<AnamnesisFieldValidationArgs>(),
    anamnesisFieldId: varchar('anamnesis_field_id', { length: 38 })
      .notNull()
      .references(() => anamnesisFieldEntity.id),
    active: boolean('active').notNull(),
  },
  (t) => [
    index()
      .on(t.tenantId, t.anamnesisFieldId)
      .where(sql`${t.isDeleted} = false`),
    addAuthenticatedPolicy(t),
    ...addDeletedAtPolicies(t),
  ],
);
