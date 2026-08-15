import { Injectable } from '@nestjs/common';
import { CustomerRepository } from '../../database/main/repositories/customer.repository';
import { GetCustomerResDto } from './dto/output/get-customer.response';
import { CustomerExceptions } from './customer-exceptions';
import { MainTransactional } from '../../database/main/main-database-connection';

@Injectable()
export class CustomerReadService {
  constructor(private readonly customerRepository: CustomerRepository) {}

  @MainTransactional()
  async require(id: string) {
    const customer = await this.customerRepository.getById(id);
    if (!customer) {
      throw CustomerExceptions.customerNotFound([
        { field: 'customerId', issue: `not found with value '${id}'` },
      ]);
    }
    return customer;
  }

  @MainTransactional()
  async requireWithPerson(id: string) {
    const customer = await this.customerRepository.findFirstByIdWithPerson(id);
    if (!customer) {
      throw CustomerExceptions.customerNotFound([
        { field: 'customerId', issue: `not found with value '${id}'` },
      ]);
    }
    return customer;
  }

  @MainTransactional()
  async requireWithPersonAndPhones(id: string): Promise<GetCustomerResDto> {
    const customer =
      await this.customerRepository.getByIdWithPersonPersonPhones(id);
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
