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
  anamnesisField: {
    anamnesisFieldValidations: r.many.anamnesisFieldValidation(),
    customerAnamnesisFields: r.many.customerAnamnesisField(),
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

  authAccount: {
    authUser: r.one.authUser({
      from: r.authAccount.userId,
      to: r.authUser.id,
    }),
  },
  authUser: {
    authAccounts: r.many.authAccount(),
    authOrganizationsViaAuthInvitation: r.many.authOrganization({
      from: r.authUser.id.through(r.authInvitation.inviterId),
      to: r.authOrganization.id.through(r.authInvitation.organizationId),
      alias: 'authUser_id_authOrganization_id_via_authInvitation',
    }),
    authOrganizationsViaAuthMember: r.many.authOrganization({
      alias: 'authOrganization_id_authUser_id_via_authMember',
    }),
  },
  authOrganization: {
    authUsersViaAuthInvitation: r.many.authUser({
      alias: 'authUser_id_authOrganization_id_via_authInvitation',
    }),
    authUsersViaAuthMember: r.many.authUser({
      from: r.authOrganization.id.through(r.authMember.organizationId),
      to: r.authUser.id.through(r.authMember.userId),
      alias: 'authOrganization_id_authUser_id_via_authMember',
    }),
  },
}));
