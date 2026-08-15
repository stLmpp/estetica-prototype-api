import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { RequireActiveOrg } from '@thallesp/nestjs-better-auth';
import { CatalogItemService } from './catalog-item.service';
import { CatalogItemReadService } from './catalog-item-read.service';
import { ResponseType } from '../../shared/decorator/response-type.decorator';
import { CreateCatalogItemRequest } from './dto/input/create-catalog-item.request';
import { CreateCatalogItemResponseModel } from './dto/output/create-catalog-item.response';
import { UpdateCatalogItemRequest } from './dto/input/update-catalog-item.request';
import { FilterCatalogItemDto } from './dto/input/list-catalog-item.request';
import { ListCatalogItemResponseModel } from './dto/output/list-catalog-item.response';
import { GetCatalogItemResponseModel } from './dto/output/get-catalog-item.response';
import { HasPermission } from '../../core/auth/has-permission.decorator';

@Controller({
  path: 'catalog-item',
  version: '1',
})
@RequireActiveOrg()
export class CatalogItemController {
  constructor(
    private readonly catalogItemService: CatalogItemService,
    private readonly catalogItemReadService: CatalogItemReadService,
  ) {}

  @ResponseType(CreateCatalogItemResponseModel, 201)
  @Post()
  @HasPermission({ orgPermissions: { catalogItem: ['create'] } })
  async create(
    @Body() body: CreateCatalogItemRequest,
  ): Promise<CreateCatalogItemResponseModel> {
    const catalogItem = await this.catalogItemService.create(body.catalogItem);
    return { data: { catalogItem } };
  }

  @Patch(':catalogItemId')
  @HasPermission({ orgPermissions: { catalogItem: ['update'] } })
  async update(
    @Param('catalogItemId') catalogItemId: string,
    @Body() body: UpdateCatalogItemRequest,
  ): Promise<void> {
    await this.catalogItemService.update(catalogItemId, body.catalogItem);
  }

  @Delete(':catalogItemId')
  @HasPermission({ orgPermissions: { catalogItem: ['delete'] } })
  async delete(@Param('catalogItemId') catalogItemId: string): Promise<void> {
    await this.catalogItemService.delete(catalogItemId);
  }

  @ResponseType(ListCatalogItemResponseModel)
  @Get()
  @HasPermission({ orgPermissions: { catalogItem: ['get'] } })
  async listPaginated(
    @Query() query: FilterCatalogItemDto,
  ): Promise<ListCatalogItemResponseModel> {
    const { catalogItems, count } =
      await this.catalogItemService.listPaginated(query);
    return {
      data: { items: catalogItems },
      meta: {
        total: count,
        limit: query.limit,
        page: query.page,
      },
    };
  }

  @ResponseType(GetCatalogItemResponseModel)
  @Get(':catalogItemId')
  @HasPermission({ orgPermissions: { catalogItem: ['get'] } })
  async getById(
    @Param('catalogItemId') catalogItemId: string,
  ): Promise<GetCatalogItemResponseModel> {
    const catalogItem =
      await this.catalogItemReadService.require(catalogItemId);
    return { data: { catalogItem } };
  }
}
