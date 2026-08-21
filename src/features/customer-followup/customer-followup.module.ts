import { Module } from '@nestjs/common';
import { MainDatabaseModule } from '../../database/main/main-database.module';
import { CustomerReadModule } from '../customer/customer-read.module';
import { AppointmentReadModule } from '../appointment/appointment-read.module';
import { SaleReadModule } from '../sale/sale-read.module';
import { CatalogItemReadModule } from '../catalog-item/catalog-item-read.module';
import { CustomerFollowupReadModule } from './customer-followup-read.module';
import { CustomerFollowupController } from './customer-followup.controller';
import { CustomerFollowupService } from './customer-followup.service';

@Module({
  controllers: [CustomerFollowupController],
  imports: [
    MainDatabaseModule,
    CustomerReadModule,
    AppointmentReadModule,
    SaleReadModule,
    CatalogItemReadModule,
    CustomerFollowupReadModule,
  ],
  providers: [CustomerFollowupService],
})
export class CustomerFollowupModule {}
