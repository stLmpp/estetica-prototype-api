import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { CustomerAnamnesisStatus } from '../../../shared/domain/customer-anamnesis-status.enum';
import { type CustomerAnamnesisFieldExtraValues } from '../../../shared/domain/customer-anamnesis-field.type';
import { type AnamnesisFieldArgs } from '../../../shared/domain/anamnesis-field.type';
import {
  addAuthenticatedPolicy,
  addDeletedAtPolicies,
  baseEntity,
} from './base';
import { customerEntity } from './person.entities';
import {
  anamnesisFieldEntity,
  anamnesisFieldType,
  anamnesisFormEntity,
} from './anamnesis-field.entities';
import { appointmentEntity } from './appointment.entities';

export const customerAnamnesisStatusEnum = pgEnum(
  'customer_anamnesis_status',
  CustomerAnamnesisStatus,
);

export const customerAnamnesisEntity = pgTable.withRLS(
  'customer_anamnesis',
  {
    ...baseEntity('canm'),
    customerId: varchar('customer_id', { length: 38 })
      .notNull()
      .references(() => customerEntity.id),
    anamnesisFormId: varchar('anamnesis_form_id', { length: 38 })
      .notNull()
      .references(() => anamnesisFormEntity.id),
    appointmentId: varchar('appointment_id', { length: 38 }).references(
      () => appointmentEntity.id,
    ),
    date: timestamp('date').notNull(),
    status: customerAnamnesisStatusEnum('status').notNull(),
    signedByName: varchar('signed_by_name', { length: 256 }),
    signedAt: timestamp('signed_at'),
  },
  (t) => [
    index()
      .on(t.tenantId, t.customerId)
      .where(sql`${t.isDeleted} = false`),
    index()
      .on(t.tenantId, t.anamnesisFormId)
      .where(sql`${t.isDeleted} = false`),
    index()
      .on(t.tenantId, t.appointmentId)
      .where(sql`${t.isDeleted} = false`),
    addAuthenticatedPolicy(t),
    ...addDeletedAtPolicies(t),
  ],
);

export const customerAnamnesisFieldEntity = pgTable.withRLS(
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
    extraValues:
      jsonb('extra_values').$type<CustomerAnamnesisFieldExtraValues>(),
    // Snapshotted from anamnesis_field/anamnesis_section at answer time —
    // same reasoning as sale_item/appointment_item.priceApplied: the field
    // referenced above can keep changing going forward, but this answer
    // must keep reading exactly as it did when it was recorded.
    fieldLabel: varchar('field_label', { length: 128 }).notNull(),
    fieldType: anamnesisFieldType('field_type').notNull(),
    fieldOptions: jsonb('field_options').$type<AnamnesisFieldArgs>(),
    fieldDisplayOrder: integer('field_display_order').notNull(),
    sectionLabel: varchar('section_label', { length: 128 }),
    sectionDisplayOrder: integer('section_display_order'),
  },
  (t) => [
    index()
      .on(t.tenantId, t.customerAnamnesisId)
      .where(sql`${t.isDeleted} = false`),
    index()
      .on(t.tenantId, t.anamnesisFieldId)
      .where(sql`${t.isDeleted} = false`),
    uniqueIndex()
      .on(t.tenantId, t.customerAnamnesisId, t.anamnesisFieldId)
      .where(sql`${t.isDeleted} = false`),
    addAuthenticatedPolicy(t),
    ...addDeletedAtPolicies(t),
  ],
);
