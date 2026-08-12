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
import { AppointmentService } from './appointment.service';
import { UpdateAppointmentRequest } from './dto/input/update-appointment.request';
import { UpdateAppointmentStatusRequest } from './dto/input/update-appointment-status.request';
import { AppointmentCreateRequest } from './dto/input/create-appointment.request';
import { CreateAppointmentResponseModel } from './dto/output/create-appointment.response';
import { FilterAppointmentDto } from './dto/input/list-appointment.request';
import { ListAppointmentResponseModel } from './dto/output/list-appointment.response';
import { GetAppointmentResponseModel } from './dto/output/get-appointment.response';
import { ResponseType } from '../../shared/decorator/response-type.decorator';
import { RequireActiveOrg } from '@thallesp/nestjs-better-auth';
import { HasPermission } from '../../core/auth/has-permission.decorator';

@Controller({
  path: 'appointment',
  version: '1',
})
@RequireActiveOrg()
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @ResponseType(CreateAppointmentResponseModel, 201)
  @Post()
  @HasPermission({
    orgPermissions: { appointment: ['create'] },
  })
  async create(
    @Body() body: AppointmentCreateRequest,
  ): Promise<CreateAppointmentResponseModel> {
    const appointment = await this.appointmentService.create(body.appointment);
    return { data: { appointment } };
  }

  @Patch(':appointmentId')
  @HasPermission({
    orgPermissions: { appointment: ['update'] },
  })
  async update(
    @Param('appointmentId') appointmentId: string,
    @Body() body: UpdateAppointmentRequest,
  ): Promise<void> {
    await this.appointmentService.update(appointmentId, body.appointment);
  }

  @Patch(':appointmentId/status')
  @HasPermission({
    orgPermissions: { appointment: ['updateStatus'] },
  })
  async updateStatus(
    @Param('appointmentId') appointmentId: string,
    @Body() body: UpdateAppointmentStatusRequest,
  ): Promise<void> {
    await this.appointmentService.updateStatus(appointmentId, body.appointment);
  }

  @Delete(':appointmentId')
  @HasPermission({
    orgPermissions: { appointment: ['delete'] },
  })
  async delete(@Param('appointmentId') appointmentId: string): Promise<void> {
    await this.appointmentService.delete(appointmentId);
  }

  @ResponseType(ListAppointmentResponseModel)
  @Get()
  @HasPermission({
    orgPermissions: { appointment: ['get'] },
  })
  async listPaginated(
    @Query() dto: FilterAppointmentDto,
  ): Promise<ListAppointmentResponseModel> {
    const { appointments, count } =
      await this.appointmentService.listPaginated(dto);
    return {
      data: { items: appointments },
      meta: {
        total: count,
        limit: dto.limit,
        page: dto.page,
      },
    };
  }

  @ResponseType(GetAppointmentResponseModel)
  @Get(':appointmentId')
  @HasPermission({
    orgPermissions: { appointment: ['get'] },
  })
  async getById(
    @Param('appointmentId') appointmentId: string,
  ): Promise<GetAppointmentResponseModel> {
    const appointment = await this.appointmentService.getById(appointmentId);
    return { data: { appointment } };
  }
}
