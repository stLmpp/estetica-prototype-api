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
import { ResponseType } from '../../shared/decorator/response-type.decorator';
import { CreateCatalogItemRequest } from './dto/input/create-catalog-item.request';
import { CreateCatalogItemResponseModel } from './dto/output/create-catalog-item.response';
import { UpdateCatalogItemRequest } from './dto/input/update-catalog-item.request';
import { FilterCatalogItemDto } from './dto/input/list-catalog-item.request';
import { ListCatalogItemResponseModel } from './dto/output/list-catalog-item.response';
import { GetCatalogItemResponseModel } from './dto/output/get-catalog-item.response';
import {
  HasPermissionV2,
  OrgHasPermission,
} from '../../core/auth/has-permission.decorator';
import { AuthRole } from '../../core/auth/constants';

@Controller({
  path: 'catalog-item',
  version: '1',
})
@RequireActiveOrg()
export class CatalogItemController {
  constructor(private readonly catalogItemService: CatalogItemService) {}

  @ResponseType(CreateCatalogItemResponseModel, 201)
  @Post()
  @OrgHasPermission({ permissions: { catalogItem: ['create'] } })
  async create(
    @Body() body: CreateCatalogItemRequest,
  ): Promise<CreateCatalogItemResponseModel> {
    const catalogItem = await this.catalogItemService.create(body.catalogItem);
    return { data: { catalogItem } };
  }

  @Patch(':catalogItemId')
  @OrgHasPermission({ permissions: { catalogItem: ['update'] } })
  async update(
    @Param('catalogItemId') catalogItemId: string,
    @Body() body: UpdateCatalogItemRequest,
  ): Promise<void> {
    await this.catalogItemService.update(catalogItemId, body.catalogItem);
  }

  @Delete(':catalogItemId')
  @OrgHasPermission({ permissions: { catalogItem: ['delete'] } })
  async delete(@Param('catalogItemId') catalogItemId: string): Promise<void> {
    await this.catalogItemService.delete(catalogItemId);
  }

  @ResponseType(ListCatalogItemResponseModel)
  @Get()
  @OrgHasPermission({ permissions: { catalogItem: ['get'] } })
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
  @HasPermissionV2({
    or: [
      {
        orgPermissions: {
          catalogItem: ['get'],
        },
      },
      {
        roles: [AuthRole.Admin],
      },
    ],
  })
  @OrgHasPermission({ permissions: { catalogItem: ['get'] } })
  async getById(
    @Param('catalogItemId') catalogItemId: string,
  ): Promise<GetCatalogItemResponseModel> {
    const catalogItem = await this.catalogItemService.getById(catalogItemId);
    return { data: { catalogItem } };
  }
}
