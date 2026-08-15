import { Module } from '@nestjs/common';
import { MainDatabaseModule } from '../../database/main/main-database.module';
import { EmployeeReadModule } from '../employee/employee-read.module';
import { CatalogItemReadModule } from '../catalog-item/catalog-item-read.module';
import { EmployeeServiceController } from './employee-service.controller';
import { EmployeeServiceService } from './employee-service.service';

@Module({
  controllers: [EmployeeServiceController],
  imports: [MainDatabaseModule, EmployeeReadModule, CatalogItemReadModule],
  providers: [EmployeeServiceService],
})
export class EmployeeServiceModule {}
