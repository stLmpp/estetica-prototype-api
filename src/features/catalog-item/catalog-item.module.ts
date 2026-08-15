import { Module } from '@nestjs/common';
import { MainDatabaseModule } from '../../database/main/main-database.module';
import { CatalogItemReadModule } from './catalog-item-read.module';
import { CatalogItemController } from './catalog-item.controller';
import { CatalogItemService } from './catalog-item.service';

@Module({
  controllers: [CatalogItemController],
  imports: [MainDatabaseModule, CatalogItemReadModule],
  providers: [CatalogItemService],
})
export class CatalogItemModule {}
