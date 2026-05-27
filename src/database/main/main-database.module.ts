import { Module } from '@nestjs/common';
import {
  MAIN_DATABASE_PROVIDERS,
  MainDatasource,
} from './main-database-connection';
import { ConfigModule } from '../../shared/config/config.module';
import { CustomerRepository } from './repositories/customer.repository';
import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { TransactionalAdapterDrizzleOrm } from '@nestjs-cls/transactional-adapter-drizzle-orm';
import { MAIN_DATABASE_CONNECTION_NAME } from './main-database-connection-name';
import { PersonRepository } from './repositories/person.repository';
import { CustomerPhoneRepository } from './repositories/customer-phone.repository';

const REPOSITORIES = [
  CustomerRepository,
  PersonRepository,
  CustomerPhoneRepository,
];

@Module({
  providers: [
    ...MAIN_DATABASE_PROVIDERS,
    ...REPOSITORIES,
  ],
  imports: [ConfigModule],
  exports: [...REPOSITORIES, MainDatasource],
})
export class MainDatabaseModule {}

export const MainDatabaseClsTransactional = new ClsPluginTransactional({
  imports: [MainDatabaseModule],
  connectionName: MAIN_DATABASE_CONNECTION_NAME,
  adapter: new TransactionalAdapterDrizzleOrm({
    drizzleInstanceToken: MainDatasource,
  }),
});
