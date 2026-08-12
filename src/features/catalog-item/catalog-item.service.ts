import { Injectable } from '@nestjs/common';
import { InferSelectModel } from 'drizzle-orm';
import { CatalogItemRepository } from '../../database/main/repositories/catalog-item.repository';
import { mainEntities } from '../../database/main/main-entities';
import { CreateCatalogItemDto } from './dto/input/create-catalog-item.request';
import { UpdateCatalogItemDto } from './dto/input/update-catalog-item.request';
import { FilterCatalogItemDto } from './dto/input/list-catalog-item.request';
import { CatalogItemExceptions } from './catalog-item-exceptions';
import { MainTransactional } from '../../database/main/main-database-connection';
import { CatalogItemModel } from './model/catalog-item.model';
import { CatalogItemType } from '../../shared/domain/catalog-item-type.enum';
import { coreExceptions } from '../../core/core-exceptions';

@Injectable()
export class CatalogItemService {
  constructor(private readonly catalogItemRepository: CatalogItemRepository) {}

  @MainTransactional()
  async create(dto: CreateCatalogItemDto) {
    this.assertDefaultDurationForServices(dto.itemType, dto.defaultDuration);
    const entity = await this.catalogItemRepository.insert({
      name: dto.name,
      itemType: dto.itemType,
      defaultPrice: dto.defaultPrice,
      defaultDuration: dto.defaultDuration,
      active: dto.active,
    });
    return this.mapEntityToDto(entity);
  }

  @MainTransactional()
  async update(id: string, dto: UpdateCatalogItemDto) {
    const catalogItem = await this.catalogItemRepository.findFirstById(id);
    if (!catalogItem) {
      throw CatalogItemExceptions.catalogItemNotFound([
        { field: 'catalogItemId', issue: `not found with value '${id}'` },
      ]);
    }
    const itemType = dto.itemType ?? catalogItem.itemType;
    const defaultDuration =
      dto.defaultDuration !== undefined
        ? dto.defaultDuration
        : catalogItem.defaultDuration;
    this.assertDefaultDurationForServices(itemType, defaultDuration);
    await this.catalogItemRepository.update(id, dto);
  }

  @MainTransactional()
  async delete(id: string) {
    const catalogItem = await this.catalogItemRepository.findFirstById(id);
    if (!catalogItem) {
      throw CatalogItemExceptions.catalogItemNotFound([
        { field: 'catalogItemId', issue: `not found with value '${id}'` },
      ]);
    }
    await this.catalogItemRepository.delete(id);
  }

  @MainTransactional()
  async listPaginated(dto: FilterCatalogItemDto) {
    const { catalogItems, count } =
      await this.catalogItemRepository.findPaginated(dto);
    return {
      catalogItems: catalogItems.map((entity) => this.mapEntityToDto(entity)),
      count,
    };
  }

  @MainTransactional()
  async getById(id: string) {
    const catalogItem = await this.catalogItemRepository.findFirstById(id);
    if (!catalogItem) {
      throw CatalogItemExceptions.catalogItemNotFound([
        { field: 'catalogItemId', issue: `not found with value '${id}'` },
      ]);
    }
    return this.mapEntityToDto(catalogItem);
  }

  private assertDefaultDurationForServices(
    itemType: CatalogItemType,
    defaultDuration: string | null | undefined,
  ) {
    if (itemType === CatalogItemType.SERVICE && !defaultDuration) {
      throw coreExceptions.invalidRequest([
        {
          field: 'defaultDuration',
          issue: 'defaultDuration is required for services',
        },
      ]);
    }
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
