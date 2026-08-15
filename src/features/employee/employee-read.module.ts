import { Module } from '@nestjs/common';
import { MainDatabaseModule } from '../../database/main/main-database.module';
import { EmployeeReadService } from './employee-read.service';

@Module({
  imports: [MainDatabaseModule],
  providers: [EmployeeReadService],
  exports: [EmployeeReadService],
})
export class EmployeeReadModule {}
