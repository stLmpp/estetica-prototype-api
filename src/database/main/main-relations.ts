import { defineRelations } from 'drizzle-orm';
import { mainEntities } from './main-entities';

export const mainRelations = defineRelations(mainEntities, (r) => ({
  // --- PERSON ---
  person: {
    personPhones: r.many.personPhone(),
    customers: r.many.customer(),
  },
  personPhone: {
    person: r.one.person({
      from: r.personPhone.personId,
      to: r.person.id,
      optional: false,
    }),
  },

  // --- EMPLOYEE ---
  employee: {
    person: r.one.person({
      from: r.employee.personId,
      to: r.person.id,
      optional: false,
    }),
    employeeServices: r.many.employeeService(),
  },

  // --- CUSTOMER ---
  customer: {
    person: r.one.person({
      from: r.customer.personId,
      to: r.person.id,
      optional: false,
    }),
    customerFollowups: r.many.customerFollowup(),
    customerAnamnesis: r.many.customerAnamnesis(),
  },

  // --- CATALOG & FOLLOWUP ---
  catalogItem: {
    followupItems: r.many.followupItem(),
    appointmentItems: r.many.appointmentItem(),
    employeeServices: r.many.employeeService(),
    saleItems: r.many.saleItem(),
  },

  employeeService: {
    employee: r.one.employee({
      from: r.employeeService.employeeId,
      to: r.employee.id,
      optional: false,
    }),
    catalogItem: r.one.catalogItem({
      from: r.employeeService.catalogItemId,
      to: r.catalogItem.id,
      optional: false,
    }),
  },

  customerFollowup: {
    customer: r.one.customer({
      from: r.customerFollowup.customerId,
      to: r.customer.id,
      optional: false,
    }),
    followupItems: r.many.followupItem(),
  },

  followupItem: {
    followup: r.one.customerFollowup({
      from: r.followupItem.followupId,
      to: r.customerFollowup.id,
      optional: false,
    }),
    catalogItem: r.one.catalogItem({
      from: r.followupItem.catalogItemId,
      to: r.catalogItem.id,
      optional: false,
    }),
  },

  // --- ANAMNESIS ---
  anamnesisForm: {
    anamnesisSections: r.many.anamnesisSection(),
    anamnesisFields: r.many.anamnesisField(),
    customerAnamnesisRecords: r.many.customerAnamnesis(),
  },

  anamnesisSection: {
    anamnesisForm: r.one.anamnesisForm({
      from: r.anamnesisSection.anamnesisFormId,
      to: r.anamnesisForm.id,
      optional: false,
    }),
    anamnesisFields: r.many.anamnesisField(),
    previousVersion: r.one.anamnesisSection({
      from: r.anamnesisSection.previousVersionId,
      to: r.anamnesisSection.id,
      optional: true,
    }),
  },

  anamnesisField: {
    anamnesisForm: r.one.anamnesisForm({
      from: r.anamnesisField.anamnesisFormId,
      to: r.anamnesisForm.id,
      optional: false,
    }),
    anamnesisSection: r.one.anamnesisSection({
      from: r.anamnesisField.anamnesisSectionId,
      to: r.anamnesisSection.id,
      optional: true,
    }),
    anamnesisFieldValidations: r.many.anamnesisFieldValidation(),
    customerAnamnesisFields: r.many.customerAnamnesisField(),
    previousVersion: r.one.anamnesisField({
      from: r.anamnesisField.previousVersionId,
      to: r.anamnesisField.id,
      optional: true,
    }),
  },

  anamnesisFieldValidation: {
    anamnesisField: r.one.anamnesisField({
      from: r.anamnesisFieldValidation.anamnesisFieldId,
      to: r.anamnesisField.id,
      optional: false,
    }),
  },

  customerAnamnesis: {
    customer: r.one.customer({
      from: r.customerAnamnesis.customerId,
      to: r.customer.id,
      optional: false,
    }),
    anamnesisForm: r.one.anamnesisForm({
      from: r.customerAnamnesis.anamnesisFormId,
      to: r.anamnesisForm.id,
      optional: false,
    }),
    appointment: r.one.appointment({
      from: r.customerAnamnesis.appointmentId,
      to: r.appointment.id,
      optional: true,
    }),
    customerAnamnesisFields: r.many.customerAnamnesisField(),
  },

  customerAnamnesisField: {
    customerAnamnesis: r.one.customerAnamnesis({
      from: r.customerAnamnesisField.customerAnamnesisId,
      to: r.customerAnamnesis.id,
      optional: false,
    }),
    anamnesisField: r.one.anamnesisField({
      from: r.customerAnamnesisField.anamnesisFieldId,
      to: r.anamnesisField.id,
      optional: false,
    }),
  },

  appointment: {
    customer: r.one.customer({
      from: r.appointment.customerId,
      to: r.customer.id,
      optional: false,
    }),
    employee: r.one.employee({
      from: r.appointment.employeeId,
      to: r.employee.id,
      optional: false,
    }),
    appointmentItems: r.many.appointmentItem(),
  },

  appointmentItem: {
    appointment: r.one.appointment({
      from: r.appointmentItem.appointmentId,
      to: r.appointment.id,
      optional: false,
    }),
    catalogItem: r.one.catalogItem({
      from: r.appointmentItem.catalogItemId,
      to: r.catalogItem.id,
      optional: false,
    }),
  },

  sale: {
    customer: r.one.customer({
      from: r.sale.customerId,
      to: r.customer.id,
      optional: false,
    }),
    employee: r.one.employee({
      from: r.sale.employeeId,
      to: r.employee.id,
      optional: false,
    }),
    appointment: r.one.appointment({
      from: r.sale.appointmentId,
      to: r.appointment.id,
      optional: true,
    }),
    saleItems: r.many.saleItem(),
    saleTransactions: r.many.saleTransaction(),
  },

  saleItem: {
    sale: r.one.sale({
      from: r.saleItem.saleId,
      to: r.sale.id,
      optional: false,
    }),
    catalogItem: r.one.catalogItem({
      from: r.saleItem.catalogItemId,
      to: r.catalogItem.id,
      optional: false,
    }),
  },

  saleTransaction: {
    sale: r.one.sale({
      from: r.saleTransaction.saleId,
      to: r.sale.id,
      optional: false,
    }),
  },
}));
