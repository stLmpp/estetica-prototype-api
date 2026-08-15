import { Injectable } from '@nestjs/common';
import { EmployeeRepository } from '../../database/main/repositories/employee.repository';
import { GetEmployeeResDto } from './dto/output/get-employee.response';
import { EmployeeExceptions } from './employee-exceptions';
import { MainTransactional } from '../../database/main/main-database-connection';

@Injectable()
export class EmployeeReadService {
  constructor(private readonly employeeRepository: EmployeeRepository) {}

  @MainTransactional()
  async require(id: string) {
    const employee = await this.employeeRepository.findFirstById(id);
    if (!employee) {
      throw EmployeeExceptions.employeeNotFound([
        { field: 'employeeId', issue: `not found with value '${id}'` },
      ]);
    }
    return employee;
  }

  @MainTransactional()
  async requireWithPerson(id: string) {
    const employee = await this.employeeRepository.findFirstByIdWithPerson(id);
    if (!employee) {
      throw EmployeeExceptions.employeeNotFound([
        { field: 'employeeId', issue: `not found with value '${id}'` },
      ]);
    }
    return employee;
  }

  @MainTransactional()
  async requireWithPersonAndPhones(id: string): Promise<GetEmployeeResDto> {
    const employee =
      await this.employeeRepository.findFirstByIdWithPersonAndPhones(id);
    if (!employee) {
      throw EmployeeExceptions.employeeNotFound([
        { field: 'employeeId', issue: `not found with value '${id}'` },
      ]);
    }
    return {
      id: employee.id,
      name: employee.person.name,
      role: employee.role,
      birthDate: employee.person.birthDate ?? undefined,
      address: employee.person.address ?? undefined,
      zipCode: employee.person.zipCode ?? undefined,
      neighborhood: employee.person.neighborhood ?? undefined,
      city: employee.person.city ?? undefined,
      state: employee.person.state ?? undefined,
      maritalStatus: employee.person.maritalStatus ?? undefined,
      phones: employee.person.personPhones,
      email: employee.person.email ?? undefined,
      workingHours: employee.workingHours,
    };
  }
}
