export * from './entities/base';
export * from './entities/person.entities';
export * from './entities/catalog-item.entities';
export * from './entities/employee-service.entities';
export * from './entities/customer-followup.entities';
export * from './entities/appointment.entities';
export * from './entities/anamnesis-field.entities';
export * from './entities/customer-anamnesis.entities';
export * from './entities/sale.entities';
export * from './entities/config.entities';

import {
  personEntity,
  employeeEntity,
  customerEntity,
  personPhoneEntity,
} from './entities/person.entities';
import { catalogItemEntity } from './entities/catalog-item.entities';
import { employeeServiceEntity } from './entities/employee-service.entities';
import {
  customerFollowupEntity,
  followupItemEntity,
} from './entities/customer-followup.entities';
import {
  appointmentEntity,
  appointmentItemEntity,
} from './entities/appointment.entities';
import {
  anamnesisFormEntity,
  anamnesisSectionEntity,
  anamnesisFieldEntity,
  anamnesisFieldValidationEntity,
} from './entities/anamnesis-field.entities';
import {
  customerAnamnesisEntity,
  customerAnamnesisFieldEntity,
} from './entities/customer-anamnesis.entities';
import {
  saleEntity,
  saleItemEntity,
  saleTransactionEntity,
} from './entities/sale.entities';
import { configEntity } from './entities/config.entities';

export const mainEntities = {
  person: personEntity,
  employee: employeeEntity,
  customer: customerEntity,
  personPhone: personPhoneEntity,
  catalogItem: catalogItemEntity,
  employeeService: employeeServiceEntity,
  customerFollowup: customerFollowupEntity,
  followupItem: followupItemEntity,
  anamnesisForm: anamnesisFormEntity,
  anamnesisSection: anamnesisSectionEntity,
  anamnesisField: anamnesisFieldEntity,
  anamnesisFieldValidation: anamnesisFieldValidationEntity,
  customerAnamnesis: customerAnamnesisEntity,
  customerAnamnesisField: customerAnamnesisFieldEntity,
  appointment: appointmentEntity,
  appointmentItem: appointmentItemEntity,
  sale: saleEntity,
  saleItem: saleItemEntity,
  saleTransaction: saleTransactionEntity,
  config: configEntity,
};
