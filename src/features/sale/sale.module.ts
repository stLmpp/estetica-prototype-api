import { Module } from '@nestjs/common';
import { MainDatabaseModule } from '../../database/main/main-database.module';
import { CustomerReadModule } from '../customer/customer-read.module';
import { EmployeeReadModule } from '../employee/employee-read.module';
import { CatalogItemReadModule } from '../catalog-item/catalog-item-read.module';
import { AppointmentReadModule } from '../appointment/appointment-read.module';
import { SaleReadModule } from './sale-read.module';
import { SaleController } from './sale.controller';
import { SaleService } from './sale.service';
import { CreateSaleUseCase } from './use-cases/create-sale.use-case';
import { AddSaleTransactionUseCase } from './use-cases/add-sale-transaction.use-case';

@Module({
  controllers: [SaleController],
  imports: [
    MainDatabaseModule,
    CustomerReadModule,
    EmployeeReadModule,
    CatalogItemReadModule,
    AppointmentReadModule,
    SaleReadModule,
  ],
  providers: [SaleService, CreateSaleUseCase, AddSaleTransactionUseCase],
})
export class SaleModule {}
