import { Module } from '@nestjs/common';
import { MainDatabaseModule } from '../../database/main/main-database.module';
import { AppointmentReadService } from './appointment-read.service';

@Module({
  imports: [MainDatabaseModule],
  providers: [AppointmentReadService],
  exports: [AppointmentReadService],
})
export class AppointmentReadModule {}
