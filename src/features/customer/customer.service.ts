import { Injectable } from '@nestjs/common';
import { CustomerRepository } from '../../database/main/repositories/customer.repository';
import { UpdateCustomerDto } from './dto/input/update-customer.request';
import { CreateCustomerDto } from './dto/input/create-customer.request';
import { SyncCustomerPhonesDto } from './dto/input/sync-customer-phones.request';

import { CreateCustomerResDto } from './dto/output/create-customer.response';
import { FilterCustomerDto } from './dto/input/list-customer.request';
import { CustomerExceptions } from './customer-exceptions';
import { MainTransactional } from '../../database/main/main-database-connection';
import { PersonRepository } from '../../database/main/repositories/person.repository';
import { PersonPhoneRepository } from '../../database/main/repositories/person-phone.repository';
import { OrganizationService } from '../../core/auth/organization.service';
import { CustomerReadService } from './customer-read.service';

@Injectable()
export class CustomerService {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly personRepository: PersonRepository,
    private readonly personPhoneRepository: PersonPhoneRepository,
    private readonly organizationService: OrganizationService,
    private readonly customerReadService: CustomerReadService,
  ) {}

  @MainTransactional()
  async create(dto: CreateCustomerDto): Promise<CreateCustomerResDto> {
    const [organization, customerCount] = await Promise.all([
      this.organizationService.getCurrentOrganization(),
      this.customerRepository.count(),
    ]);
    if (organization && customerCount >= organization.customerLimit) {
      throw CustomerExceptions.customerLimitExceeded();
    }

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
      this.personPhoneRepository.insertMany(
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

  @MainTransactional()
  async update(id: string, dto: UpdateCustomerDto) {
    const customer = await this.customerReadService.require(id);
    const { jobName, ...person } = dto;
    await Promise.all([
      this.customerRepository.update(id, { jobName }),
      this.personRepository.update(customer.personId, person),
    ]);
  }

  @MainTransactional()
  async delete(id: string) {
    await this.customerReadService.require(id);
    await this.customerRepository.delete(id);
  }

  @MainTransactional()
  async syncPhones(id: string, dto: SyncCustomerPhonesDto['phones']) {
    const customer = await this.customerReadService.require(id);
    const existingPhones = await this.personPhoneRepository.findAllByPersonId(
      customer.personId,
    );

    const toKey = (phone: { type: string; number: string }) =>
      `${phone.type}:${phone.number}`;
    const existingKeys = new Set(existingPhones.map(toKey));
    const desiredKeys = new Set(dto.map(toKey));

    const toInsert = dto.filter((phone) => !existingKeys.has(toKey(phone)));
    const toDeleteIds = existingPhones
      .filter((phone) => !desiredKeys.has(toKey(phone)))
      .map((phone) => phone.id);

    const [insertedPhones] = await Promise.all([
      this.personPhoneRepository.insertMany(
        toInsert.map((phone) => ({
          type: phone.type,
          number: phone.number,
          personId: customer.personId,
        })),
      ),
      this.personPhoneRepository.deleteMany(toDeleteIds),
    ]);

    const keptPhones = existingPhones.filter((phone) =>
      desiredKeys.has(toKey(phone)),
    );
    return [...keptPhones, ...insertedPhones];
  }

  @MainTransactional()
  async listPaginated(dto: FilterCustomerDto) {
    return this.customerRepository.listPaginated(dto);
  }
}
