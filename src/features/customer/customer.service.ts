import { Injectable } from '@nestjs/common';
import { CustomerRepository } from '../../database/main/repositories/customer.repository';
import { UpdateCustomerDto } from './dto/input/update-customer.request';
import { CreateCustomerDto } from './dto/input/create-customer.request';

import { CreateCustomerResDto } from './dto/output/create-customer.response';
import { FilterCustomerDto } from './dto/input/list-customer.request';
import { GetCustomerResDto } from './dto/output/get-customer.response';
import { CustomerExceptions } from './customer-exceptions';
import { MainTransactional } from '../../database/main/main-database-connection';
import { PersonRepository } from '../../database/main/repositories/person.repository';
import { CustomerPhoneRepository } from '../../database/main/repositories/customer-phone.repository';

@Injectable()
export class CustomerService {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly personRepository: PersonRepository,
    private readonly customerPhoneRepository: CustomerPhoneRepository,
  ) {}

  @MainTransactional()
  async create(dto: CreateCustomerDto): Promise<CreateCustomerResDto> {
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
    const [customer, phones] = await Promise.all([
      this.customerRepository.insert({
        personId: person.id,
        jobName: dto.jobName,
      }),
      this.customerPhoneRepository.insertMany(
        dto.phones?.map((phone) => ({
          number: phone.number,
          type: phone.type,
          personId: person.id,
        })) ?? [],
      ),
    ]);
    return {
      id: customer.id,
      name: person.name,
      birthDate: person.birthDate ?? undefined,
      address: person.address ?? undefined,
      zipCode: person.zipCode ?? undefined,
      neighborhood: person.neighborhood ?? undefined,
      city: person.city ?? undefined,
      state: person.state ?? undefined,
      jobName: customer.jobName ?? undefined,
      maritalStatus: person.maritalStatus ?? undefined,
      email: person.email ?? undefined,
      phones,
    };
  }

  async update(id: number, dto: UpdateCustomerDto) {
    await this.customerRepository.update(id, dto);
  }

  async listPaginated(dto: FilterCustomerDto) {
    return this.customerRepository.listPaginated(dto);
  }

  async getById(id: number): Promise<GetCustomerResDto> {
    const customer = await this.customerRepository.getById(id);
    if (!customer) {
      throw CustomerExceptions.customerNotFound([
        { field: 'customerId', issue: `not found with value '${id}'` },
      ]);
    }
    return {
      id: customer.id,
      name: customer.person.name,
      birthDate: customer.person.birthDate ?? undefined,
      address: customer.person.address ?? undefined,
      zipCode: customer.person.zipCode ?? undefined,
      neighborhood: customer.person.neighborhood ?? undefined,
      city: customer.person.city ?? undefined,
      state: customer.person.state ?? undefined,
      jobName: customer.jobName ?? undefined,
      maritalStatus: customer.person.maritalStatus ?? undefined,
      phones: customer.person.personPhones,
      email: customer.person.email ?? undefined,
    };
  }
}
