import { Module } from '@nestjs/common';
import { MainDatabaseModule } from '../../database/main/main-database.module';
import { EmployeeServiceController } from './employee-service.controller';
import { EmployeeServiceService } from './employee-service.service';

@Module({
  controllers: [EmployeeServiceController],
  imports: [MainDatabaseModule],
  providers: [EmployeeServiceService],
})
export class EmployeeServiceModule {}
