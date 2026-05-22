import { Injectable, NotFoundException } from '@nestjs/common';
import { CustomerRepository } from '../../database/main/repositories/customer.repository';
import { UpdateCustomerDto } from './dto/input/update-customer.request';
import { CreateCustomerDto } from './dto/input/create-customer.request';

import { CreateCustomerResDto } from './dto/output/create-customer.response';
import { FilterCustomerDto } from './dto/input/list-customer.request';
import { GetCustomerResDto } from './dto/output/get-customer.response';

@Injectable()
export class CustomerService {
  constructor(private readonly customerRepository: CustomerRepository) {}

  async create(dto: CreateCustomerDto): Promise<CreateCustomerResDto> {
    const entity = await this.customerRepository.insert(dto, dto.phones ?? []);
    return {
      id: entity.id,
      name: entity.name,
      birthDate: entity.birthDate ?? undefined,
      address: entity.address ?? undefined,
      zipCode: entity.zipCode ?? undefined,
      neighborhood: entity.neighborhood ?? undefined,
      city: entity.city ?? undefined,
      state: entity.state ?? undefined,
      jobName: entity.jobName ?? undefined,
      maritalStatus: entity.maritalStatus ?? undefined,
      email: entity.email ?? undefined,
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
      // TODO exceptions
      throw new NotFoundException(`Customer not found with id ${id}`);
    }
    return {
      id: customer.id,
      name: customer.name,
      birthDate: customer.birthDate ?? undefined,
      address: customer.address ?? undefined,
      zipCode: customer.zipCode ?? undefined,
      neighborhood: customer.neighborhood ?? undefined,
      city: customer.city ?? undefined,
      state: customer.state ?? undefined,
      jobName: customer.jobName ?? undefined,
      maritalStatus: customer.maritalStatus ?? undefined,
      phones: customer.phones,
      email: customer.email ?? undefined,
    };
  }
}
