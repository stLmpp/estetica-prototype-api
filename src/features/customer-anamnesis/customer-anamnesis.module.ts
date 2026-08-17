import { Module } from '@nestjs/common';
import { MainDatabaseModule } from '../../database/main/main-database.module';
import { CustomerReadModule } from '../customer/customer-read.module';
import { AppointmentReadModule } from '../appointment/appointment-read.module';
import { AnamnesisFieldReadModule } from '../anamnesis-field/anamnesis-field-read.module';
import { CustomerAnamnesisController } from './customer-anamnesis.controller';
import { CustomerAnamnesisService } from './customer-anamnesis.service';

@Module({
  imports: [
    MainDatabaseModule,
    CustomerReadModule,
    AppointmentReadModule,
    AnamnesisFieldReadModule,
  ],
  controllers: [CustomerAnamnesisController],
  providers: [CustomerAnamnesisService],
})
export class CustomerAnamnesisModule {}
