import { Module } from '@nestjs/common';
import { MainDatabaseModule } from '../../database/main/main-database.module';
import { CatalogItemReadService } from './catalog-item-read.service';

@Module({
  imports: [MainDatabaseModule],
  providers: [CatalogItemReadService],
  exports: [CatalogItemReadService],
})
export class CatalogItemReadModule {}
