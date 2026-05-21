import { Injectable } from '@nestjs/common';
import { CustomerRepository } from '../../database/main/repositories/customer.repository';
import { UpdateCustomerDto } from './dto/input/update-customer.request';
import { CreateCustomerDto } from './dto/input/create-customer.request';

import { CustomerResponseDto } from './dto/output/create-customer.response';
import { FilterCustomerDto } from './dto/input/list-customer.request';

@Injectable()
export class CustomerService {
  constructor(private readonly customerRepository: CustomerRepository) {}

  async create(dto: CreateCustomerDto): Promise<CustomerResponseDto> {
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
}
