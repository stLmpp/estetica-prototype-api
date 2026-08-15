import { Injectable } from '@nestjs/common';
import { AppointmentRepository } from '../../database/main/repositories/appointment.repository';
import { AppointmentExceptions } from './appointment-exceptions';
import { MainTransactional } from '../../database/main/main-database-connection';
import { GetAppointmentResDto } from './dto/output/get-appointment.response';

@Injectable()
export class AppointmentReadService {
  constructor(private readonly appointmentRepository: AppointmentRepository) {}

  @MainTransactional()
  async require(id: string) {
    const appointment = await this.appointmentRepository.findFirstById(id);
    if (!appointment) {
      throw AppointmentExceptions.appointmentNotFound([
        { field: 'appointmentId', issue: `not found with value '${id}'` },
      ]);
    }
    return appointment;
  }

  @MainTransactional()
  async requireWithCustomerAndEmployeeAndCatalogItem(
    id: string,
  ): Promise<GetAppointmentResDto> {
    const appointment =
      await this.appointmentRepository.findFirstByIdWithCustomerAndEmployeeAndCatalogItem(
        id,
      );
    if (!appointment) {
      throw AppointmentExceptions.appointmentNotFound([
        { field: 'appointmentId', issue: `not found with value '${id}'` },
      ]);
    }
    return {
      id: appointment.id,
      status: appointment.status,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      notes: appointment.notes ?? undefined,
      customerId: appointment.customerId,
      customerName: appointment.customerName,
      employeeId: appointment.employeeId,
      employeeName: appointment.employeeName,
      catalogItemId: appointment.catalogItemId,
      catalogItemName: appointment.catalogItemName,
      priceApplied: appointment.priceApplied,
    };
  }

  @MainTransactional()
  async requireWithItems(id: string) {
    const appointment =
      await this.appointmentRepository.findFirstByIdWithItems(id);
    if (!appointment) {
      throw AppointmentExceptions.appointmentNotFound([
        { field: 'appointmentId', issue: `not found with value '${id}'` },
      ]);
    }
    return appointment;
  }
}
