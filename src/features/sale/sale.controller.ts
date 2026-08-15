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
import { SaleService } from './sale.service';
import { CreateSaleRequest } from './dto/input/create-sale.request';
import { CreateSaleResponseModel } from './dto/output/create-sale.response';
import { AddSaleTransactionRequest } from './dto/input/add-sale-transaction.request';
import { AddSaleTransactionResponseModel } from './dto/output/add-sale-transaction.response';
import { UpdateSaleStatusRequest } from './dto/input/update-sale-status.request';
import { FilterSaleDto } from './dto/input/list-sale.request';
import { ListSaleResponseModel } from './dto/output/list-sale.response';
import { GetSaleResponseModel } from './dto/output/get-sale.response';
import { ResponseType } from '../../shared/decorator/response-type.decorator';
import { HasPermission } from '../../core/auth/has-permission.decorator';

@Controller({
  path: 'sale',
  version: '1',
})
@RequireActiveOrg()
export class SaleController {
  constructor(private readonly saleService: SaleService) {}

  @ResponseType(CreateSaleResponseModel, 201)
  @Post()
  @HasPermission({
    orgPermissions: { sale: ['create'] },
  })
  async create(
    @Body() body: CreateSaleRequest,
  ): Promise<CreateSaleResponseModel> {
    const sale = await this.saleService.create(body.sale);
    return { data: { sale } };
  }

  @ResponseType(AddSaleTransactionResponseModel, 201)
  @Post(':saleId/transaction')
  @HasPermission({
    orgPermissions: { sale: ['addTransaction'] },
  })
  async addTransaction(
    @Param('saleId') saleId: string,
    @Body() body: AddSaleTransactionRequest,
  ): Promise<AddSaleTransactionResponseModel> {
    const data = await this.saleService.addTransaction(
      saleId,
      body.transaction,
    );
    return { data };
  }

  @Patch(':saleId/status')
  @HasPermission({
    orgPermissions: { sale: ['updateStatus'] },
  })
  async updateStatus(
    @Param('saleId') saleId: string,
    @Body() body: UpdateSaleStatusRequest,
  ): Promise<void> {
    await this.saleService.updateStatus(saleId, body.sale);
  }

  @Delete(':saleId')
  @HasPermission({
    orgPermissions: { sale: ['delete'] },
  })
  async delete(@Param('saleId') saleId: string): Promise<void> {
    await this.saleService.delete(saleId);
  }

  @ResponseType(ListSaleResponseModel)
  @Get()
  @HasPermission({
    orgPermissions: { sale: ['get'] },
  })
  async listPaginated(
    @Query() dto: FilterSaleDto,
  ): Promise<ListSaleResponseModel> {
    const { sales, count } = await this.saleService.listPaginated(dto);
    return {
      data: { items: sales },
      meta: {
        total: count,
        limit: dto.limit,
        page: dto.page,
      },
    };
  }

  @ResponseType(GetSaleResponseModel)
  @Get(':saleId')
  @HasPermission({
    orgPermissions: { sale: ['get'] },
  })
  async getById(
    @Param('saleId') saleId: string,
  ): Promise<GetSaleResponseModel> {
    const sale = await this.saleService.requireWithDetails(saleId);
    return { data: { sale } };
  }
}
