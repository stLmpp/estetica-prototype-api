import { Injectable } from '@nestjs/common';
import { EmployeeRepository } from '../../database/main/repositories/employee.repository';
import { UpdateEmployeeDto } from './dto/input/update-employee.request';
import { CreateEmployeeDto } from './dto/input/create-employee.request';
import { CreateEmployeeResDto } from './dto/output/create-employee.response';
import { FilterEmployeeDto } from './dto/input/list-employee.request';
import { GetEmployeeResDto } from './dto/output/get-employee.response';
import { EmployeeExceptions } from './employee-exceptions';
import { MainTransactional } from '../../database/main/main-database-connection';
import { PersonRepository } from '../../database/main/repositories/person.repository';
import { PersonPhoneRepository } from '../../database/main/repositories/person-phone.repository';

@Injectable()
export class EmployeeService {
  constructor(
    private readonly employeeRepository: EmployeeRepository,
    private readonly personRepository: PersonRepository,
    private readonly personPhoneRepository: PersonPhoneRepository,
  ) {}

  @MainTransactional()
  async create(dto: CreateEmployeeDto): Promise<CreateEmployeeResDto> {
    const person = await this.personRepository.insert({
      name: dto.name,
      birthDate: dto.birthDate,
      address: dto.address,
      zipCode: dto.zipCode,
      neighborhood: dto.neighborhood,
      city: dto.city,
      state: dto.state,
      maritalStatus: dto.maritalStatus,
      email: dto.email,
    });
    const [employee, phones] = await Promise.all([
      this.employeeRepository.insert({
        personId: person.id,
        role: dto.role,
        workingHours: dto.workingHours,
      }),
      this.personPhoneRepository.insertMany(
        dto.phones?.map((phone) => ({
          number: phone.number,
          type: phone.type,
          personId: person.id,
        })) ?? [],
      ),
    ]);
    return {
      id: employee.id,
      name: person.name,
      role: employee.role,
      birthDate: person.birthDate ?? undefined,
      address: person.address ?? undefined,
      zipCode: person.zipCode ?? undefined,
      neighborhood: person.neighborhood ?? undefined,
      city: person.city ?? undefined,
      state: person.state ?? undefined,
      maritalStatus: person.maritalStatus ?? undefined,
      email: person.email ?? undefined,
      phones,
      workingHours: employee.workingHours,
    };
  }

  @MainTransactional()
  async update(id: string, dto: UpdateEmployeeDto) {
    const employee = await this.employeeRepository.findFirstById(id);
    if (!employee) {
      throw EmployeeExceptions.employeeNotFound([
        { field: 'employeeId', issue: `not found with value '${id}'` },
      ]);
    }
    const { role, workingHours, ...person } = dto;
    await Promise.all([
      this.employeeRepository.update(id, { role, workingHours }),
      this.personRepository.update(employee.personId, person),
    ]);
  }

  @MainTransactional()
  async delete(id: string) {
    const employee = await this.employeeRepository.findFirstById(id);
    if (!employee) {
      throw EmployeeExceptions.employeeNotFound([
        { field: 'employeeId', issue: `not found with value '${id}'` },
      ]);
    }
    await this.employeeRepository.delete(id);
  }

  @MainTransactional()
  async listPaginated(dto: FilterEmployeeDto) {
    return this.employeeRepository.findPaginated(dto);
  }

  @MainTransactional()
  async getById(id: string): Promise<GetEmployeeResDto> {
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
