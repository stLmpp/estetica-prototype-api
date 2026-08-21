import { Body, Controller, Post } from '@nestjs/common';
import { RequireActiveOrg } from '@thallesp/nestjs-better-auth';
import { CustomerFollowupService } from './customer-followup.service';
import { CreateCustomerFollowupRequest } from './dto/input/create-customer-followup.request';
import { CreateCustomerFollowupResponseModel } from './dto/output/create-customer-followup.response';
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
}
