import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CustomerReadService } from './customer-read.service';
import { UpdateCustomerRequest } from './dto/input/update-customer.request';
import { CustomerCreateRequest } from './dto/input/create-customer.request';
import { SyncCustomerPhonesRequest } from './dto/input/sync-customer-phones.request';
import { CreateCustomerResponseModel } from './dto/output/create-customer.response';
import { FilterCustomerDto } from './dto/input/list-customer.request';
import { ListCustomerResponseModel } from './dto/output/list-customer.response';
import { GetCustomerResponseModel } from './dto/output/get-customer.response';
import { SyncCustomerPhonesResponseModel } from './dto/output/sync-customer-phones.response';
import { ResponseType } from '../../shared/decorator/response-type.decorator';
import { RequireActiveOrg } from '@thallesp/nestjs-better-auth';
import { HasPermission } from '../../core/auth/has-permission.decorator';

@Controller({
  path: 'customer',
  version: '1',
})
@RequireActiveOrg()
export class CustomerController {
  constructor(
    private readonly customerService: CustomerService,
    private readonly customerReadService: CustomerReadService,
  ) {}

  @ResponseType(CreateCustomerResponseModel, 201)
  @Post()
  @HasPermission({
    orgPermissions: { customer: ['create'], person: ['create'] },
  })
  async create(
    @Body() body: CustomerCreateRequest,
  ): Promise<CreateCustomerResponseModel> {
    const customer = await this.customerService.create(body.customer);
    return { data: { customer } };
  }

  @Patch(':customerId')
  @HasPermission({
    orgPermissions: { customer: ['update'] },
  })
  async update(
    @Param('customerId') customerId: string,
    @Body() body: UpdateCustomerRequest,
  ): Promise<void> {
    await this.customerService.update(customerId, body.customer);
  }

  @Delete(':customerId')
  @HasPermission({
    orgPermissions: { customer: ['delete'] },
  })
  async delete(@Param('customerId') customerId: string): Promise<void> {
    await this.customerService.delete(customerId);
  }

  @ResponseType(SyncCustomerPhonesResponseModel)
  @Put(':customerId/phones')
  @HasPermission({
    orgPermissions: { customer: ['update'] },
  })
  async syncPhones(
    @Param('customerId') customerId: string,
    @Body() body: SyncCustomerPhonesRequest,
  ): Promise<SyncCustomerPhonesResponseModel> {
    const phones = await this.customerService.syncPhones(
      customerId,
      body.customer.phones,
    );
    return { data: { phones } };
  }

  @ResponseType(ListCustomerResponseModel)
  @Get()
  @HasPermission({
    orgPermissions: { customer: ['get'] },
  })
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
  @HasPermission({
    orgPermissions: { customer: ['get'], person: ['get'] },
  })
  async getById(
    @Param('customerId') customerId: string,
  ): Promise<GetCustomerResponseModel> {
    const customer =
      await this.customerReadService.requireWithPersonAndPhones(customerId);
    return { data: { customer } };
  }
}
