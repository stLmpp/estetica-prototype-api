import { Module } from '@nestjs/common';
import { MAIN_DATABASE_PROVIDERS } from './main-database-connection';
import { ConfigModule } from '../../shared/config/config.module';
import { CustomerRepository } from './repositories/customer.repository';

@Module({
  providers: [
    ...MAIN_DATABASE_PROVIDERS,
    CustomerRepository,
  ],
  imports: [ConfigModule],
  exports: [CustomerRepository],
})
export class MainDatabaseModule {}
