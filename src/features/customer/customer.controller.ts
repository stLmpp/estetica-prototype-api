import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CustomerUpdateBodyDto } from './dto/customer-update.dto';
import { CustomerCreateRequest } from './dto/input/create-customer.request';
import { CustomerCreateResponseModel } from './dto/output/create-customer.response';

@Controller({
  path: 'customer',
  version: '1',
})
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  async create(
    @Body() body: CustomerCreateRequest,
  ): Promise<CustomerCreateResponseModel> {
    const customer = await this.customerService.create(body.customer);
    return {
      data: {
        customer,
      },
    };
  }

  @Patch(':customerId')
  async update(
    @Param('customerId', ParseIntPipe) customerId: number,
    @Body() updateCustomerDto: CustomerUpdateBodyDto,
  ): Promise<void> {
    return this.customerService.update(customerId, updateCustomerDto);
  }
}
