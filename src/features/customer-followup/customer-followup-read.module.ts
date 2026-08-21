import { Module } from '@nestjs/common';
import { MainDatabaseModule } from '../../database/main/main-database.module';
import { CustomerFollowupReadService } from './customer-followup-read.service';

@Module({
  imports: [MainDatabaseModule],
  providers: [CustomerFollowupReadService],
  exports: [CustomerFollowupReadService],
})
export class CustomerFollowupReadModule {}
