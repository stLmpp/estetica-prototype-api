import { Injectable } from '@nestjs/common';
import { CustomerRepository } from '../../database/main/repositories/customer.repository';
import { CustomerUpdateBodyDto } from './dto/customer-update.dto';
import { CreateCustomerDto } from './dto/input/create-customer.request';

import { CustomerResponseDto } from './dto/output/create-customer.response';

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

  async update(id: number, dto: CustomerUpdateBodyDto) {
    await this.customerRepository.update(id, dto);
  }
}
