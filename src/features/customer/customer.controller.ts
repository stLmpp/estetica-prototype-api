import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
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

@Controller({
  path: 'customer',
  version: '1',
})
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @ResponseType(CreateCustomerResponseModel, 201)
  @Post()
  async create(
    @Body() body: CustomerCreateRequest,
  ): Promise<CreateCustomerResponseModel> {
    const customer = await this.customerService.create(body.customer);
    return { data: { customer } };
  }

  @Patch(':customerId')
  async update(
    @Param('customerId', ParseIntPipe) customerId: number,
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
    @Param('customerId', ParseIntPipe) customerId: number,
  ): Promise<GetCustomerResponseModel> {
    const customer = await this.customerService.getById(customerId);
    return { data: { customer } };
  }
}
