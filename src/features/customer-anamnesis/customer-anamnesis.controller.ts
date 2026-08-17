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
import { CustomerAnamnesisService } from './customer-anamnesis.service';
import { ResponseType } from '../../shared/decorator/response-type.decorator';
import { CreateCustomerAnamnesisRequest } from './dto/input/create-customer-anamnesis.request';
import { CreateCustomerAnamnesisResponseModel } from './dto/output/create-customer-anamnesis.response';
import { UpdateCustomerAnamnesisRequest } from './dto/input/update-customer-anamnesis.request';
import { FinalizeCustomerAnamnesisRequest } from './dto/input/finalize-customer-anamnesis.request';
import { FinalizeCustomerAnamnesisResponseModel } from './dto/output/finalize-customer-anamnesis.response';
import { FilterCustomerAnamnesisDto } from './dto/input/list-customer-anamnesis.request';
import { ListCustomerAnamnesisResponseModel } from './dto/output/list-customer-anamnesis.response';
import { GetCustomerAnamnesisResponseModel } from './dto/output/get-customer-anamnesis.response';
import { HasPermission } from '../../core/auth/has-permission.decorator';

@Controller({
  path: 'customer/:customerId/anamnesis',
  version: '1',
})
@RequireActiveOrg()
export class CustomerAnamnesisController {
  constructor(
    private readonly customerAnamnesisService: CustomerAnamnesisService,
  ) {}

  @ResponseType(CreateCustomerAnamnesisResponseModel, 201)
  @Post()
  @HasPermission({ orgPermissions: { customerAnamnesis: ['create'] } })
  async create(
    @Param('customerId') customerId: string,
    @Body() body: CreateCustomerAnamnesisRequest,
  ): Promise<CreateCustomerAnamnesisResponseModel> {
    const customerAnamnesis = await this.customerAnamnesisService.create(
      customerId,
      body.customerAnamnesis,
    );
    return { data: { customerAnamnesis } };
  }

  @Patch(':anamnesisId')
  @HasPermission({ orgPermissions: { customerAnamnesis: ['update'] } })
  async update(
    @Param('customerId') customerId: string,
    @Param('anamnesisId') anamnesisId: string,
    @Body() body: UpdateCustomerAnamnesisRequest,
  ): Promise<void> {
    await this.customerAnamnesisService.update(
      customerId,
      anamnesisId,
      body.customerAnamnesis,
    );
  }

  @ResponseType(FinalizeCustomerAnamnesisResponseModel)
  @Patch(':anamnesisId/finalize')
  @HasPermission({ orgPermissions: { customerAnamnesis: ['finalize'] } })
  async finalize(
    @Param('customerId') customerId: string,
    @Param('anamnesisId') anamnesisId: string,
    @Body() body: FinalizeCustomerAnamnesisRequest,
  ): Promise<FinalizeCustomerAnamnesisResponseModel> {
    const customerAnamnesis = await this.customerAnamnesisService.finalize(
      customerId,
      anamnesisId,
      body.customerAnamnesis,
    );
    return { data: { customerAnamnesis } };
  }

  @Delete(':anamnesisId')
  @HasPermission({ orgPermissions: { customerAnamnesis: ['delete'] } })
  async delete(
    @Param('customerId') customerId: string,
    @Param('anamnesisId') anamnesisId: string,
  ): Promise<void> {
    await this.customerAnamnesisService.delete(customerId, anamnesisId);
  }

  @ResponseType(ListCustomerAnamnesisResponseModel)
  @Get()
  @HasPermission({ orgPermissions: { customerAnamnesis: ['get'] } })
  async listPaginated(
    @Param('customerId') customerId: string,
    @Query() query: FilterCustomerAnamnesisDto,
  ): Promise<ListCustomerAnamnesisResponseModel> {
    const { customerAnamnesisRecords, count } =
      await this.customerAnamnesisService.listPaginated(customerId, query);
    return {
      data: { items: customerAnamnesisRecords },
      meta: {
        total: count,
        limit: query.limit,
        page: query.page,
      },
    };
  }

  @ResponseType(GetCustomerAnamnesisResponseModel)
  @Get(':anamnesisId')
  @HasPermission({ orgPermissions: { customerAnamnesis: ['get'] } })
  async getById(
    @Param('customerId') customerId: string,
    @Param('anamnesisId') anamnesisId: string,
  ): Promise<GetCustomerAnamnesisResponseModel> {
    const customerAnamnesis = await this.customerAnamnesisService.getById(
      customerId,
      anamnesisId,
    );
    return { data: { customerAnamnesis } };
  }
}
