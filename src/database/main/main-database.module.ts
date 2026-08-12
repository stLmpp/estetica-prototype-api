import { Module } from '@nestjs/common';
import {
  MAIN_DATABASE_PROVIDERS,
  MainDatasource,
} from './main-database-connection';
import { EnvironmentModule } from '../../core/config/environment.module';
import { CustomerRepository } from './repositories/customer.repository';
import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { MAIN_DATABASE_CONNECTION_NAME } from './main-database-connection-name';
import { PersonRepository } from './repositories/person.repository';
import { PersonPhoneRepository } from './repositories/person-phone.repository';
import { AnamnesisFieldRepository } from './repositories/anamnesis-field.repository';
import { TransactionalAdapterDrizzleOrmCustom } from '../../core/transactional-adapter-drizzle-orm-custom';
import { ConfigRepository } from './repositories/config.repository';
import { ConfigAdminRepository } from './repositories/config-admin.repository';
import { AuthOrganizationRepository } from './repositories/auth-organization.repository';
import { AuthUserRepository } from './repositories/auth-user.repository';
import { CatalogItemRepository } from './repositories/catalog-item.repository';
import { EmployeeRepository } from './repositories/employee.repository';
import { EmployeeServiceRepository } from './repositories/employee-service.repository';
import { AppointmentRepository } from './repositories/appointment.repository';

const REPOSITORIES = [
  CustomerRepository,
  PersonRepository,
  PersonPhoneRepository,
  AnamnesisFieldRepository,
  ConfigRepository,
  ConfigAdminRepository,
  AuthOrganizationRepository,
  AuthUserRepository,
  CatalogItemRepository,
  EmployeeRepository,
  EmployeeServiceRepository,
  AppointmentRepository,
];

@Module({
  providers: [
    ...MAIN_DATABASE_PROVIDERS,
    ...REPOSITORIES,
  ],
  imports: [EnvironmentModule],
  exports: [...REPOSITORIES, MainDatasource],
})
export class MainDatabaseModule {}

export const MainDatabaseClsTransactional = new ClsPluginTransactional({
  imports: [MainDatabaseModule],
  connectionName: MAIN_DATABASE_CONNECTION_NAME,
  adapter: new TransactionalAdapterDrizzleOrmCustom({
    drizzleInstanceToken: MainDatasource,
  }),
});
