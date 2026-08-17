import { Module } from '@nestjs/common';
import { MainDatabaseModule } from '../../database/main/main-database.module';
import { CustomerReadModule } from '../customer/customer-read.module';
import { EmployeeReadModule } from '../employee/employee-read.module';
import { CatalogItemReadModule } from '../catalog-item/catalog-item-read.module';
import { SaleReadModule } from '../sale/sale-read.module';
import { AppointmentReadModule } from './appointment-read.module';
import { AppointmentController } from './appointment.controller';
import { AppointmentService } from './appointment.service';

@Module({
  controllers: [AppointmentController],
  imports: [
    MainDatabaseModule,
    CustomerReadModule,
    EmployeeReadModule,
    CatalogItemReadModule,
    AppointmentReadModule,
    SaleReadModule,
  ],
  providers: [AppointmentService],
})
export class AppointmentModule {}
