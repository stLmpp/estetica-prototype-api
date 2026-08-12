import { Injectable } from '@nestjs/common';
import { EmployeeServiceRepository } from '../../database/main/repositories/employee-service.repository';
import { EmployeeRepository } from '../../database/main/repositories/employee.repository';
import { CatalogItemRepository } from '../../database/main/repositories/catalog-item.repository';
import { CreateEmployeeServiceDto } from './dto/input/create-employee-service.request';
import { CreateEmployeeServiceResDto } from './dto/output/create-employee-service.response';
import { FilterEmployeeServiceDto } from './dto/input/list-employee-service.request';
import { EmployeeServiceExceptions } from './employee-service-exceptions';
import { MainTransactional } from '../../database/main/main-database-connection';
import { EmployeeExceptions } from '../employee/employee-exceptions';
import { CatalogItemExceptions } from '../catalog-item/catalog-item-exceptions';

@Injectable()
export class EmployeeServiceService {
  constructor(
    private readonly employeeServiceRepository: EmployeeServiceRepository,
    private readonly employeeRepository: EmployeeRepository,
    private readonly catalogItemRepository: CatalogItemRepository,
  ) {}

  @MainTransactional()
  async create(
    dto: CreateEmployeeServiceDto,
  ): Promise<CreateEmployeeServiceResDto> {
    const [employee, catalogItem] = await Promise.all([
      this.employeeRepository.findFirstById(dto.employeeId),
      this.catalogItemRepository.findFirstById(dto.catalogItemId),
    ]);
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
    const existing =
      await this.employeeServiceRepository.findFirstByEmployeeAndCatalogItem(
        dto.employeeId,
        dto.catalogItemId,
      );
    if (existing) {
      throw EmployeeServiceExceptions.employeeServiceAlreadyLinked([
        {
          field: 'employeeId',
          issue: 'this employee is already linked to this service',
        },
      ]);
    }
    const employeeService = await this.employeeServiceRepository.insert(
      dto.employeeId,
      dto.catalogItemId,
    );
    return {
      id: employeeService.id,
      employeeId: employeeService.employeeId,
      catalogItemId: employeeService.catalogItemId,
    };
  }

  @MainTransactional()
  async delete(id: string) {
    const employeeService =
      await this.employeeServiceRepository.findFirstById(id);
    if (!employeeService) {
      throw EmployeeServiceExceptions.employeeServiceNotFound([
        { field: 'employeeServiceId', issue: `not found with value '${id}'` },
      ]);
    }
    await this.employeeServiceRepository.delete(id);
  }

  @MainTransactional()
  async listPaginated(dto: FilterEmployeeServiceDto) {
    return this.employeeServiceRepository.findPaginated(dto);
  }

  @MainTransactional()
  async syncForEmployee(employeeId: string, catalogItemIds: string[]) {
    const employee = await this.employeeRepository.findFirstById(employeeId);
    if (!employee) {
      throw EmployeeExceptions.employeeNotFound([
        { field: 'employeeId', issue: `not found with value '${employeeId}'` },
      ]);
    }

    const uniqueCatalogItemIds = [...new Set(catalogItemIds)];
    const catalogItems =
      await this.catalogItemRepository.findManyByIds(uniqueCatalogItemIds);
    if (catalogItems.length !== uniqueCatalogItemIds.length) {
      throw CatalogItemExceptions.catalogItemNotFound([
        // TODO add a specific exception for this and list the catalog itens that were not found
        {
          field: 'catalogItemIds',
          issue: 'one or more catalog items were not found',
        },
      ]);
    }

    const existingLinks =
      await this.employeeServiceRepository.findAllActiveByEmployeeId(
        employeeId,
      );
    const existingCatalogItemIds = existingLinks.map(
      (link) => link.catalogItemId,
    );

    const toAdd = uniqueCatalogItemIds.filter(
      (id) => !existingCatalogItemIds.includes(id),
    );
    const toRemove = existingCatalogItemIds.filter(
      (id) => !uniqueCatalogItemIds.includes(id),
    );

    const [insertedLinks] = await Promise.all([
      this.employeeServiceRepository.insertMany(employeeId, toAdd),
      this.employeeServiceRepository.deleteManyByEmployeeAndCatalogItems(
        employeeId,
        toRemove,
      ),
    ]);

    const keptLinks = existingLinks.filter(
      (link) => !toRemove.includes(link.catalogItemId),
    );
    return [...keptLinks, ...insertedLinks].map((link) => ({
      id: link.id,
      employeeId: link.employeeId,
      catalogItemId: link.catalogItemId,
    }));
  }
}
