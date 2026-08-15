import { Injectable } from '@nestjs/common';
import { InferSelectModel } from 'drizzle-orm';
import { CatalogItemRepository } from '../../database/main/repositories/catalog-item.repository';
import { mainEntities } from '../../database/main/main-entities';
import { CatalogItemExceptions } from './catalog-item-exceptions';
import { MainTransactional } from '../../database/main/main-database-connection';
import { CatalogItemModel } from './model/catalog-item.model';

@Injectable()
export class CatalogItemReadService {
  constructor(private readonly catalogItemRepository: CatalogItemRepository) {}

  @MainTransactional()
  async require(id: string) {
    const catalogItem = await this.catalogItemRepository.findFirstById(id);
    if (!catalogItem) {
      throw CatalogItemExceptions.catalogItemNotFound([
        { field: 'catalogItemId', issue: `not found with value '${id}'` },
      ]);
    }
    return this.mapEntityToDto(catalogItem);
  }

  private mapEntityToDto(
    entity: InferSelectModel<typeof mainEntities.catalogItem>,
  ): CatalogItemModel {
    return {
      id: entity.id,
      name: entity.name,
      itemType: entity.itemType,
      defaultPrice: entity.defaultPrice ?? undefined,
      defaultDuration: entity.defaultDuration ?? undefined,
      active: entity.active,
    };
  }
}
