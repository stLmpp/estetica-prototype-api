import { Module } from '@nestjs/common';
import { MainDatabaseModule } from '../../database/main/main-database.module';
import { AppointmentController } from './appointment.controller';
import { AppointmentService } from './appointment.service';

@Module({
  controllers: [AppointmentController],
  imports: [MainDatabaseModule],
  providers: [AppointmentService],
})
export class AppointmentModule {}
