import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { EmployeeServiceService } from './employee-service.service';
import { EmployeeServiceCreateRequest } from './dto/input/create-employee-service.request';
import { CreateEmployeeServiceResponseModel } from './dto/output/create-employee-service.response';
import { FilterEmployeeServiceDto } from './dto/input/list-employee-service.request';
import { ListEmployeeServiceResponseModel } from './dto/output/list-employee-service.response';
import { SyncEmployeeServiceRequest } from './dto/input/sync-employee-service.request';
import { SyncEmployeeServiceResponseModel } from './dto/output/sync-employee-service.response';
import { ResponseType } from '../../shared/decorator/response-type.decorator';
import { RequireActiveOrg } from '@thallesp/nestjs-better-auth';
import { HasPermission } from '../../core/auth/has-permission.decorator';

@Controller({
  path: 'employee-service',
  version: '1',
})
@RequireActiveOrg()
export class EmployeeServiceController {
  constructor(
    private readonly employeeServiceService: EmployeeServiceService,
  ) {}

  @ResponseType(CreateEmployeeServiceResponseModel, 201)
  @Post()
  @HasPermission({
    orgPermissions: { employeeService: ['create'] },
  })
  async create(
    @Body() body: EmployeeServiceCreateRequest,
  ): Promise<CreateEmployeeServiceResponseModel> {
    const employeeService = await this.employeeServiceService.create(
      body.employeeService,
    );
    return { data: { employeeService } };
  }

  @ResponseType(SyncEmployeeServiceResponseModel)
  @Put('employee/:employeeId')
  @HasPermission({
    orgPermissions: { employeeService: ['create', 'delete'] },
  })
  async syncForEmployee(
    @Param('employeeId') employeeId: string,
    @Body() body: SyncEmployeeServiceRequest,
  ): Promise<SyncEmployeeServiceResponseModel> {
    const employeeServices = await this.employeeServiceService.syncForEmployee(
      employeeId,
      body.catalogItemIds,
    );
    return { data: { employeeServices } };
  }

  @Delete(':employeeServiceId')
  @HasPermission({
    orgPermissions: { employeeService: ['delete'] },
  })
  async delete(
    @Param('employeeServiceId') employeeServiceId: string,
  ): Promise<void> {
    await this.employeeServiceService.delete(employeeServiceId);
  }

  @ResponseType(ListEmployeeServiceResponseModel)
  @Get()
  @HasPermission({
    orgPermissions: { employeeService: ['get'] },
  })
  async listPaginated(
    @Query() dto: FilterEmployeeServiceDto,
  ): Promise<ListEmployeeServiceResponseModel> {
    const { employeeServices, count } =
      await this.employeeServiceService.listPaginated(dto);
    return {
      data: { items: employeeServices },
      meta: {
        total: count,
        limit: dto.limit,
        page: dto.page,
      },
    };
  }
}
