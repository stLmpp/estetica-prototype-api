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
import { EmployeeService } from './employee.service';
import { UpdateEmployeeRequest } from './dto/input/update-employee.request';
import { EmployeeCreateRequest } from './dto/input/create-employee.request';
import { CreateEmployeeResponseModel } from './dto/output/create-employee.response';
import { FilterEmployeeDto } from './dto/input/list-employee.request';
import { ListEmployeeResponseModel } from './dto/output/list-employee.response';
import { GetEmployeeResponseModel } from './dto/output/get-employee.response';
import { ResponseType } from '../../shared/decorator/response-type.decorator';
import { RequireActiveOrg } from '@thallesp/nestjs-better-auth';
import { HasPermission } from '../../core/auth/has-permission.decorator';

@Controller({
  path: 'employee',
  version: '1',
})
@RequireActiveOrg()
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @ResponseType(CreateEmployeeResponseModel, 201)
  @Post()
  @HasPermission({
    orgPermissions: { employee: ['create'], person: ['create'] },
  })
  async create(
    @Body() body: EmployeeCreateRequest,
  ): Promise<CreateEmployeeResponseModel> {
    const employee = await this.employeeService.create(body.employee);
    return { data: { employee } };
  }

  @Patch(':employeeId')
  @HasPermission({
    orgPermissions: { employee: ['update'] },
  })
  async update(
    @Param('employeeId') employeeId: string,
    @Body() body: UpdateEmployeeRequest,
  ): Promise<void> {
    await this.employeeService.update(employeeId, body.employee);
  }

  @Delete(':employeeId')
  @HasPermission({
    orgPermissions: { employee: ['delete'] },
  })
  async delete(@Param('employeeId') employeeId: string): Promise<void> {
    await this.employeeService.delete(employeeId);
  }

  @ResponseType(ListEmployeeResponseModel)
  @Get()
  @HasPermission({
    orgPermissions: { employee: ['get'] },
  })
  async listPaginated(
    @Query() dto: FilterEmployeeDto,
  ): Promise<ListEmployeeResponseModel> {
    const { employees, count } = await this.employeeService.listPaginated(dto);
    return {
      data: { items: employees },
      meta: {
        total: count,
        limit: dto.limit,
        page: dto.page,
      },
    };
  }

  @ResponseType(GetEmployeeResponseModel)
  @Get(':employeeId')
  @HasPermission({
    orgPermissions: { employee: ['get'], person: ['get'] },
  })
  async getById(
    @Param('employeeId') employeeId: string,
  ): Promise<GetEmployeeResponseModel> {
    const employee = await this.employeeService.getById(employeeId);
    return { data: { employee } };
  }
}
