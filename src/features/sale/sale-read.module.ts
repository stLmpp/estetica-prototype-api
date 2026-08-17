import { Module } from '@nestjs/common';
import { MainDatabaseModule } from '../../database/main/main-database.module';
import { SaleReadService } from './sale-read.service';

@Module({
  imports: [MainDatabaseModule],
  providers: [SaleReadService],
  exports: [SaleReadService],
})
export class SaleReadModule {}
