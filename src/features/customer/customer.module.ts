import { Module } from '@nestjs/common';
import { MainDatabaseModule } from '../../database/main/main-database.module';
import { CustomerReadModule } from './customer-read.module';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';

@Module({
  controllers: [CustomerController],
  imports: [MainDatabaseModule, CustomerReadModule],
  providers: [CustomerService],
})
export class CustomerModule {}
