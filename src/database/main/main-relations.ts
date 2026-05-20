import { defineRelations } from 'drizzle-orm';
import { mainEntities } from './main-entities';

export const mainRelations = defineRelations(mainEntities, (r) => ({
  // --- CUSTOMER ---
  customer: {
    phones: r.many.customerPhone(),
    followups: r.many.customerFollowup(),
    anamneses: r.many.customerAnamnese(),
  },

  customerPhone: {
    customer: r.one.customer({
      from: r.customerPhone.customerId,
      to: r.customer.id,
    }),
  },

  // --- CATALOG & FOLLOWUP ---
  catalogItem: {
    followupItems: r.many.followupItem(),
  },

  customerFollowup: {
    customer: r.one.customer({
      from: r.customerFollowup.customerId,
      to: r.customer.id,
    }),
    items: r.many.followupItem(),
  },

  followupItem: {
    followup: r.one.customerFollowup({
      from: r.followupItem.followupId,
      to: r.customerFollowup.id,
    }),
    catalogItem: r.one.catalogItem({
      from: r.followupItem.catalogItemId,
      to: r.catalogItem.id,
    }),
  },

  // --- ANAMNESE ---
  anamneseField: {
    validations: r.many.anamneseFieldValidation(),
    customerAnamneseFields: r.many.customerAnamneseField(),
  },

  anamneseFieldValidation: {
    anamneseField: r.one.anamneseField({
      from: r.anamneseFieldValidation.anamneseFieldId,
      to: r.anamneseField.id,
    }),
  },

  customerAnamnese: {
    customer: r.one.customer({
      from: r.customerAnamnese.customerId,
      to: r.customer.id,
    }),
    fields: r.many.customerAnamneseField(),
  },

  customerAnamneseField: {
    customerAnamnese: r.one.customerAnamnese({
      from: r.customerAnamneseField.customerAnamneseId,
      to: r.customerAnamnese.id,
    }),
    anamneseField: r.one.anamneseField({
      from: r.customerAnamneseField.anamneseFieldId,
      to: r.anamneseField.id,
    }),
  },
}));
