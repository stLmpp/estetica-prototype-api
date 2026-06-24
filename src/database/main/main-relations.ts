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
    customerAnamnesis: r.many.customerAnamnesis({
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
    appointmentItems: r.many.appointmentItem({
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

  // --- ANAMNESIS ---
  anamnesisField: {
    anamnesisFieldValidations: r.many.anamnesisFieldValidation({
      where: {
        deletedAt: {
          isNull: true,
        },
      },
    }),
    customerAnamnesisFields: r.many.customerAnamnesisField({
      where: {
        deletedAt: {
          isNull: true,
        },
      },
    }),
  },

  anamnesisFieldValidation: {
    anamnesisField: r.one.anamnesisField({
      from: r.anamnesisFieldValidation.anamnesisFieldId,
      to: r.anamnesisField.id,
      where: {
        deletedAt: {
          isNull: true,
        },
      },
      optional: false,
    }),
  },

  customerAnamnesis: {
    customer: r.one.customer({
      from: r.customerAnamnesis.customerId,
      to: r.customer.id,
      where: {
        deletedAt: {
          isNull: true,
        },
      },
      optional: false,
    }),
    customerAnamnesisFields: r.many.customerAnamnesisField({
      where: {
        deletedAt: {
          isNull: true,
        },
      },
    }),
  },

  customerAnamnesisField: {
    customerAnamnesis: r.one.customerAnamnesis({
      from: r.customerAnamnesisField.customerAnamnesisId,
      to: r.customerAnamnesis.id,
      where: {
        deletedAt: {
          isNull: true,
        },
      },
      optional: false,
    }),
    anamnesisField: r.one.anamnesisField({
      from: r.customerAnamnesisField.anamnesisFieldId,
      to: r.anamnesisField.id,
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

  appointmentItem: {
    appointment: r.one.appointment({
      from: r.appointmentItem.appointmentId,
      to: r.appointment.id,
      where: {
        deletedAt: {
          isNull: true,
        },
      },
      optional: false,
    }),
    catalogItem: r.one.catalogItem({
      from: r.appointmentItem.catalogItemId,
      to: r.catalogItem.id,
      where: {
        deletedAt: {
          isNull: true,
        },
      },
      optional: false,
    }),
  },
}));
