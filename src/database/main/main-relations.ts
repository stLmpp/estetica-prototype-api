import { defineRelations } from 'drizzle-orm';
import { mainEntities } from './main-entities';

export const mainRelations = defineRelations(mainEntities, (r) => ({
  // --- PERSON ---
  person: {
    personPhones: r.many.personPhone({
      where: {
        deletedAt: {
          isNull: true,
        },
      },
    }),
    customers: r.many.customer({
      where: {
        deletedAt: {
          isNull: true,
        },
      },
    }),
  },
  personPhone: {
    person: r.one.person({
      from: r.personPhone.personId,
      to: r.person.id,
      where: {
        deletedAt: {
          isNull: true,
        },
      },
      optional: false,
    }),
  },

  // --- EMPLOYEE ---
  employee: {
    person: r.one.person({
      from: r.employee.personId,
      to: r.person.id,
      where: {
        deletedAt: {
          isNull: true,
        },
      },
      optional: false,
    }),
  },

  // --- CUSTOMER ---
  customer: {
    person: r.one.person({
      from: r.customer.personId,
      to: r.person.id,
      where: {
        deletedAt: {
          isNull: true,
        },
      },
      optional: false,
    }),
    customerFollowups: r.many.customerFollowup({
      where: {
        deletedAt: {
          isNull: true,
        },
      },
    }),
    customerAnamneses: r.many.customerAnamnese({
      where: {
        deletedAt: {
          isNull: true,
        },
      },
    }),
  },

  // --- CATALOG & FOLLOWUP ---
  catalogItem: {
    followupItems: r.many.followupItem({
      where: {
        deletedAt: {
          isNull: true,
        },
      },
    }),
  },

  customerFollowup: {
    customer: r.one.customer({
      from: r.customerFollowup.customerId,
      to: r.customer.id,
      where: {
        deletedAt: {
          isNull: true,
        },
      },
      optional: false,
    }),
    followupItems: r.many.followupItem({
      where: {
        deletedAt: {
          isNull: true,
        },
      },
    }),
  },

  followupItem: {
    followup: r.one.customerFollowup({
      from: r.followupItem.followupId,
      to: r.customerFollowup.id,
      where: {
        deletedAt: {
          isNull: true,
        },
      },
      optional: false,
    }),
    catalogItem: r.one.catalogItem({
      from: r.followupItem.catalogItemId,
      to: r.catalogItem.id,
      where: {
        deletedAt: {
          isNull: true,
        },
      },
      optional: false,
    }),
  },

  // --- ANAMNESE ---
  anamneseField: {
    anamneseFieldValidations: r.many.anamneseFieldValidation({
      where: {
        deletedAt: {
          isNull: true,
        },
      },
    }),
    customerAnamneseFields: r.many.customerAnamneseField({
      where: {
        deletedAt: {
          isNull: true,
        },
      },
    }),
  },

  anamneseFieldValidation: {
    anamneseField: r.one.anamneseField({
      from: r.anamneseFieldValidation.anamneseFieldId,
      to: r.anamneseField.id,
      where: {
        deletedAt: {
          isNull: true,
        },
      },
      optional: false,
    }),
  },

  customerAnamnese: {
    customer: r.one.customer({
      from: r.customerAnamnese.customerId,
      to: r.customer.id,
      where: {
        deletedAt: {
          isNull: true,
        },
      },
      optional: false,
    }),
    customerAnamneseFields: r.many.customerAnamneseField({
      where: {
        deletedAt: {
          isNull: true,
        },
      },
    }),
  },

  customerAnamneseField: {
    customerAnamnese: r.one.customerAnamnese({
      from: r.customerAnamneseField.customerAnamneseId,
      to: r.customerAnamnese.id,
      where: {
        deletedAt: {
          isNull: true,
        },
      },
      optional: false,
    }),
    anamneseField: r.one.anamneseField({
      from: r.customerAnamneseField.anamneseFieldId,
      to: r.anamneseField.id,
      where: {
        deletedAt: {
          isNull: true,
        },
      },
      optional: false,
    }),
  },

  appointment: {
    customer: r.one.customer({
      from: r.appointment.customerId,
      to: r.customer.id,
      where: {
        deletedAt: {
          isNull: true,
        },
      },
      optional: false,
    }),
    employee: r.one.employee({
      from: r.appointment.employeeId,
      to: r.employee.id,
      where: {
        deletedAt: {
          isNull: true,
        },
      },
      optional: false,
    }),
    appointmentItems: r.many.appointmentItem({
      where: {
        deletedAt: {
          isNull: true,
        },
      },
    }),
  },
}));
