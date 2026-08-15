import { Module } from '@nestjs/common';
import { MainDatabaseModule } from '../../database/main/main-database.module';
import { CustomerReadService } from './customer-read.service';

@Module({
  imports: [MainDatabaseModule],
  providers: [CustomerReadService],
  exports: [CustomerReadService],
})
export class CustomerReadModule {}
