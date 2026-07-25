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
import { CustomerPhoneRepository } from './repositories/customer-phone.repository';
import { AnamnesisFieldRepository } from './repositories/anamnesis-field.repository';
import { TransactionalAdapterDrizzleOrmCustom } from '../../core/transactional-adapter-drizzle-orm-custom';

const REPOSITORIES = [
  CustomerRepository,
  PersonRepository,
  CustomerPhoneRepository,
  AnamnesisFieldRepository,
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
