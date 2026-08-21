import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { RequireActiveOrg } from '@thallesp/nestjs-better-auth';
import { CustomerFollowupService } from './customer-followup.service';
import { CustomerFollowupReadService } from './customer-followup-read.service';
import { CreateCustomerFollowupRequest } from './dto/input/create-customer-followup.request';
import { CreateCustomerFollowupResponseModel } from './dto/output/create-customer-followup.response';
import { FilterCustomerFollowupDto } from './dto/input/list-customer-followup.request';
import { ListCustomerFollowupResponseModel } from './dto/output/list-customer-followup.response';
import { GetCustomerFollowupResponseModel } from './dto/output/get-customer-followup.response';
import { ResponseType } from '../../shared/decorator/response-type.decorator';
import { HasPermission } from '../../core/auth/has-permission.decorator';

@Controller({
  path: 'customer-followup',
  version: '1',
})
@RequireActiveOrg()
export class CustomerFollowupController {
  constructor(
    private readonly customerFollowupService: CustomerFollowupService,
    private readonly customerFollowupReadService: CustomerFollowupReadService,
  ) {}

  @ResponseType(CreateCustomerFollowupResponseModel, 201)
  @Post()
  @HasPermission({ orgPermissions: { customerFollowup: ['create'] } })
  async create(
    @Body() body: CreateCustomerFollowupRequest,
  ): Promise<CreateCustomerFollowupResponseModel> {
    const customerFollowup = await this.customerFollowupService.create(
      body.customerFollowup,
    );
    return { data: { customerFollowup } };
  }

  @ResponseType(ListCustomerFollowupResponseModel)
  @Get()
  @HasPermission({ orgPermissions: { customerFollowup: ['get'] } })
  async listPaginated(
    @Query() dto: FilterCustomerFollowupDto,
  ): Promise<ListCustomerFollowupResponseModel> {
    const { items, count } =
      await this.customerFollowupService.listPaginated(dto);
    return {
      data: { items },
      meta: { total: count, limit: dto.limit, page: dto.page },
    };
  }

  @ResponseType(GetCustomerFollowupResponseModel)
  @Get(':customerFollowupId')
  @HasPermission({ orgPermissions: { customerFollowup: ['get'] } })
  async getById(
    @Param('customerFollowupId') customerFollowupId: string,
  ): Promise<GetCustomerFollowupResponseModel> {
    const customerFollowup =
      await this.customerFollowupReadService.requireWithItems(
        customerFollowupId,
      );
    return { data: { customerFollowup } };
  }
}
