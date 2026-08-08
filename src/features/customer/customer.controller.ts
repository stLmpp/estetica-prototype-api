import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { UpdateCustomerRequest } from './dto/input/update-customer.request';
import { CustomerCreateRequest } from './dto/input/create-customer.request';
import { CreateCustomerResponseModel } from './dto/output/create-customer.response';
import { FilterCustomerDto } from './dto/input/list-customer.request';
import { ListCustomerResponseModel } from './dto/output/list-customer.response';
import { GetCustomerResponseModel } from './dto/output/get-customer.response';
import { ResponseType } from '../../shared/decorator/response-type.decorator';
import { OrgRoles, RequireActiveOrg } from '@thallesp/nestjs-better-auth';

import { AuthOrgRole } from '../../core/auth/constants';

@Controller({
  path: 'customer',
  version: '1',
})
@RequireActiveOrg()
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @ResponseType(CreateCustomerResponseModel, 201)
  @Post()
  @OrgRoles([AuthOrgRole.Admin])
  async create(
    @Body() body: CustomerCreateRequest,
  ): Promise<CreateCustomerResponseModel> {
    const customer = await this.customerService.create(body.customer);
    return { data: { customer } };
  }

  @Patch(':customerId')
  @OrgRoles([AuthOrgRole.Admin])
  async update(
    @Param('customerId') customerId: string,
    @Body() body: UpdateCustomerRequest,
  ): Promise<void> {
    await this.customerService.update(customerId, body.customer);
  }

  @ResponseType(ListCustomerResponseModel)
  @Get()
  async listPaginated(
    @Query() dto: FilterCustomerDto,
  ): Promise<ListCustomerResponseModel> {
    const { customers, count } = await this.customerService.listPaginated(dto);
    return {
      data: { items: customers },
      meta: {
        total: count,
        limit: dto.limit,
        page: dto.page,
      },
    };
  }

  @ResponseType(GetCustomerResponseModel)
  @Get(':customerId')
  async getById(
    @Param('customerId') customerId: string,
  ): Promise<GetCustomerResponseModel> {
    const customer = await this.customerService.getById(customerId);
    return { data: { customer } };
  }
}
