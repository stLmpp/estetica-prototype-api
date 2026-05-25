import { Injectable } from '@nestjs/common';
import { CustomerRepository } from '../../database/main/repositories/customer.repository';
import { UpdateCustomerDto } from './dto/input/update-customer.request';
import { CreateCustomerDto } from './dto/input/create-customer.request';

import { CreateCustomerResDto } from './dto/output/create-customer.response';
import { FilterCustomerDto } from './dto/input/list-customer.request';
import { GetCustomerResDto } from './dto/output/get-customer.response';
import { CustomerExceptions } from './customer-exceptions';

@Injectable()
export class CustomerService {
  constructor(private readonly customerRepository: CustomerRepository) {}

  async create(dto: CreateCustomerDto): Promise<CreateCustomerResDto> {
    const entity = await this.customerRepository.insert(
      {
        jobName: dto.jobName,
        person: {
          name: dto.name,
          birthDate: dto.birthDate,
          address: dto.address,
          zipCode: dto.zipCode,
          neighborhood: dto.neighborhood,
          city: dto.city,
          state: dto.state,
          maritalStatus: dto.maritalStatus,
          email: dto.email,
        },
      },
      dto.phones ?? [],
    );
    return {
      id: entity.id,
      name: entity.person.name,
      birthDate: entity.person.birthDate ?? undefined,
      address: entity.person.address ?? undefined,
      zipCode: entity.person.zipCode ?? undefined,
      neighborhood: entity.person.neighborhood ?? undefined,
      city: entity.person.city ?? undefined,
      state: entity.person.state ?? undefined,
      jobName: entity.jobName ?? undefined,
      maritalStatus: entity.person.maritalStatus ?? undefined,
      email: entity.person.email ?? undefined,
      phones: entity.phones,
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
      phones: customer.person.personPhone,
      email: customer.person.email ?? undefined,
    };
  }
}
