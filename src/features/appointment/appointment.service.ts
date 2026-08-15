import { Injectable } from '@nestjs/common';
import { AppointmentRepository } from '../../database/main/repositories/appointment.repository';
import { CustomerRepository } from '../../database/main/repositories/customer.repository';
import { EmployeeRepository } from '../../database/main/repositories/employee.repository';
import { CatalogItemRepository } from '../../database/main/repositories/catalog-item.repository';
import { OrganizationService } from '../../core/auth/organization.service';
import { CreateAppointmentDto } from './dto/input/create-appointment.request';
import { CreateAppointmentResDto } from './dto/output/create-appointment.response';
import { UpdateAppointmentDto } from './dto/input/update-appointment.request';
import { UpdateAppointmentStatusDto } from './dto/input/update-appointment-status.request';
import { FilterAppointmentDto } from './dto/input/list-appointment.request';
import { GetAppointmentResDto } from './dto/output/get-appointment.response';
import { GetDayScheduleDto } from './dto/input/get-day-schedule.request';
import { DayScheduleAppointmentDto } from './dto/output/get-day-schedule.response';
import { GetCalendarRangeDto } from './dto/input/get-calendar-range.request';
import { CalendarAppointmentDto } from './dto/output/get-calendar-range.response';
import { AppointmentExceptions } from './appointment-exceptions';
import { CustomerExceptions } from '../customer/customer-exceptions';
import { EmployeeExceptions } from '../employee/employee-exceptions';
import { CatalogItemExceptions } from '../catalog-item/catalog-item-exceptions';
import { coreExceptions } from '../../core/core-exceptions';
import { MainTransactional } from '../../database/main/main-database-connection';
import { AppointmentStatus } from '../../shared/domain/appointment-staus.enum';
import {
  getWeekdayKey,
  isWithinDayWorkingHours,
  resolveDayWorkingHours,
  WeeklyWorkingHours,
} from '../../shared/model/working-hours.model';
import dayjs from 'dayjs';

const TERMINAL_APPOINTMENT_STATUSES = new Set<AppointmentStatus>([
  AppointmentStatus.COMPLETED,
  AppointmentStatus.CANCELLED,
  AppointmentStatus.NO_SHOW,
]);

@Injectable()
export class AppointmentService {
  constructor(
    private readonly appointmentRepository: AppointmentRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly employeeRepository: EmployeeRepository,
    private readonly catalogItemRepository: CatalogItemRepository,
    private readonly organizationService: OrganizationService,
  ) {}

  private assertWithinWorkingHours(
    employeeWorkingHours: WeeklyWorkingHours | null | undefined,
    organizationWorkingHours: WeeklyWorkingHours | null,
    startTime: Date,
    endTime: Date,
  ) {
    if (!dayjs(startTime).isSame(endTime, 'day')) {
      throw AppointmentExceptions.appointmentOutsideWorkingHours([
        {
          field: 'endTime',
          issue: 'appointment must start and end on the same day',
        },
      ]);
    }
    const weekday = getWeekdayKey(startTime);
    const dayHours = resolveDayWorkingHours(
      weekday,
      employeeWorkingHours,
      organizationWorkingHours,
    );
    if (!dayHours || !isWithinDayWorkingHours(dayHours, startTime, endTime)) {
      throw AppointmentExceptions.appointmentOutsideWorkingHours([
        {
          field: 'startTime',
          issue:
            'time range falls outside the employee/organization working hours',
        },
      ]);
    }
  }

  @MainTransactional()
  async create(dto: CreateAppointmentDto): Promise<CreateAppointmentResDto> {
    const [customer, employee, catalogItem, organization] = await Promise.all([
      this.customerRepository.findFirstByIdWithPerson(dto.customerId),
      this.employeeRepository.findFirstByIdWithPerson(dto.employeeId),
      this.catalogItemRepository.findFirstById(dto.catalogItemId),
      this.organizationService.getCurrentOrganization(),
    ]);
    if (!customer) {
      throw CustomerExceptions.customerNotFound([
        {
          field: 'customerId',
          issue: `not found with value '${dto.customerId}'`,
        },
      ]);
    }
    if (!employee) {
      throw EmployeeExceptions.employeeNotFound([
        {
          field: 'employeeId',
          issue: `not found with value '${dto.employeeId}'`,
        },
      ]);
    }
    if (!catalogItem) {
      throw CatalogItemExceptions.catalogItemNotFound([
        {
          field: 'catalogItemId',
          issue: `not found with value '${dto.catalogItemId}'`,
        },
      ]);
    }

    this.assertWithinWorkingHours(
      employee.workingHours,
      organization.workingHours,
      dto.startTime,
      dto.endTime,
    );

    const priceApplied = dto.priceApplied ?? catalogItem.defaultPrice;
    if (!priceApplied) {
      throw coreExceptions.invalidRequest([
        {
          field: 'priceApplied',
          issue:
            'catalog item has no default price; priceApplied must be provided',
        },
      ]);
    }

    const conflict = await this.appointmentRepository.hasConflict(
      dto.employeeId,
      dto.startTime,
      dto.endTime,
    );
    if (conflict) {
      throw AppointmentExceptions.appointmentConflict([
        {
          field: 'startTime',
          issue: 'employee already has an appointment in this time range',
        },
      ]);
    }

    const appointment = await this.appointmentRepository.insert({
      customerId: dto.customerId,
      employeeId: dto.employeeId,
      startTime: dto.startTime,
      endTime: dto.endTime,
      status: AppointmentStatus.SCHEDULED,
      notes: dto.notes,
    });
    await this.appointmentRepository.insertItem(
      appointment.id,
      dto.catalogItemId,
      priceApplied,
    );

    return {
      id: appointment.id,
      status: appointment.status,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      notes: appointment.notes ?? undefined,
      customerId: customer.id,
      customerName: customer.person.name,
      employeeId: employee.id,
      employeeName: employee.person.name,
      catalogItemId: catalogItem.id,
      catalogItemName: catalogItem.name,
      priceApplied,
    };
  }

  @MainTransactional()
  async update(id: string, dto: UpdateAppointmentDto) {
    const appointment = await this.appointmentRepository.findFirstById(id);
    if (!appointment) {
      throw AppointmentExceptions.appointmentNotFound([
        { field: 'appointmentId', issue: `not found with value '${id}'` },
      ]);
    }

    const newStartTime = dto.startTime ?? appointment.startTime;
    const newEndTime = dto.endTime ?? appointment.endTime;
    if (newEndTime <= newStartTime) {
      throw coreExceptions.invalidRequest([
        { field: 'endTime', issue: 'endTime must be after startTime' },
      ]);
    }

    if (dto.startTime || dto.endTime) {
      const [employee, organization, conflict] = await Promise.all([
        this.employeeRepository.findFirstById(appointment.employeeId),
        this.organizationService.getCurrentOrganization(),
        this.appointmentRepository.hasConflict(
          appointment.employeeId,
          newStartTime,
          newEndTime,
          id,
        ),
      ]);
      if (conflict) {
        throw AppointmentExceptions.appointmentConflict([
          {
            field: 'startTime',
            issue: 'employee already has an appointment in this time range',
          },
        ]);
      }
      this.assertWithinWorkingHours(
        employee?.workingHours,
        organization.workingHours,
        newStartTime,
        newEndTime,
      );
    }

    await this.appointmentRepository.update(id, dto);
  }

  @MainTransactional()
  async updateStatus(id: string, dto: UpdateAppointmentStatusDto) {
    const appointment = await this.appointmentRepository.findFirstById(id);
    if (!appointment) {
      throw AppointmentExceptions.appointmentNotFound([
        { field: 'appointmentId', issue: `not found with value '${id}'` },
      ]);
    }
    if (dto.status === appointment.status) {
      return;
    }
    if (TERMINAL_APPOINTMENT_STATUSES.has(appointment.status)) {
      throw AppointmentExceptions.appointmentInvalidStatusTransition([
        {
          field: 'status',
          issue: `cannot transition from terminal status '${appointment.status}' to '${dto.status}'`,
        },
      ]);
    }
    await this.appointmentRepository.update(id, { status: dto.status });
  }

  @MainTransactional()
  async delete(id: string) {
    const appointment = await this.appointmentRepository.findFirstById(id);
    if (!appointment) {
      throw AppointmentExceptions.appointmentNotFound([
        { field: 'appointmentId', issue: `not found with value '${id}'` },
      ]);
    }
    await this.appointmentRepository.delete(id);
  }

  @MainTransactional()
  async listPaginated(dto: FilterAppointmentDto) {
    return this.appointmentRepository.findPaginated(dto);
  }

  @MainTransactional()
  async getById(id: string): Promise<GetAppointmentResDto> {
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
  async getDaySchedule(
    dto: GetDayScheduleDto,
  ): Promise<DayScheduleAppointmentDto[]> {
    const employee = await this.employeeRepository.findFirstById(
      dto.employeeId,
    );
    if (!employee) {
      throw EmployeeExceptions.employeeNotFound([
        {
          field: 'employeeId',
          issue: `not found with value '${dto.employeeId}'`,
        },
      ]);
    }
    return this.appointmentRepository.findManyForDaySchedule(
      dto.employeeId,
      dto.from,
      dto.to,
    );
  }

  @MainTransactional()
  async getCalendarRange(
    dto: GetCalendarRangeDto,
  ): Promise<CalendarAppointmentDto[]> {
    if (dto.employeeId) {
      const employee = await this.employeeRepository.findFirstById(
        dto.employeeId,
      );
      if (!employee) {
        throw EmployeeExceptions.employeeNotFound([
          {
            field: 'employeeId',
            issue: `not found with value '${dto.employeeId}'`,
          },
        ]);
      }
    }
    return this.appointmentRepository.findManyForCalendarRange(
      dto.from,
      dto.to,
      dto.employeeId,
    );
  }
}
