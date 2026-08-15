import { Module } from '@nestjs/common';
import { MainDatabaseModule } from '../../database/main/main-database.module';
import { EmployeeReadModule } from './employee-read.module';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';

@Module({
  controllers: [EmployeeController],
  imports: [MainDatabaseModule, EmployeeReadModule],
  providers: [EmployeeService],
})
export class EmployeeModule {}
