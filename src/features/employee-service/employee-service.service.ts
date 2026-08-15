import { Injectable } from '@nestjs/common';
import { EmployeeServiceRepository } from '../../database/main/repositories/employee-service.repository';
import { CatalogItemRepository } from '../../database/main/repositories/catalog-item.repository';
import { EmployeeReadService } from '../employee/employee-read.service';
import { CatalogItemReadService } from '../catalog-item/catalog-item-read.service';
import { CreateEmployeeServiceDto } from './dto/input/create-employee-service.request';
import { CreateEmployeeServiceResDto } from './dto/output/create-employee-service.response';
import { FilterEmployeeServiceDto } from './dto/input/list-employee-service.request';
import { EmployeeServiceExceptions } from './employee-service-exceptions';
import { MainTransactional } from '../../database/main/main-database-connection';
import { CatalogItemExceptions } from '../catalog-item/catalog-item-exceptions';

@Injectable()
export class EmployeeServiceService {
  constructor(
    private readonly employeeServiceRepository: EmployeeServiceRepository,
    private readonly catalogItemRepository: CatalogItemRepository,
    private readonly employeeReadService: EmployeeReadService,
    private readonly catalogItemReadService: CatalogItemReadService,
  ) {}

  @MainTransactional()
  async create(
    dto: CreateEmployeeServiceDto,
  ): Promise<CreateEmployeeServiceResDto> {
    await Promise.all([
      this.employeeReadService.require(dto.employeeId),
      this.catalogItemReadService.require(dto.catalogItemId),
    ]);
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
    await this.require(id);
    await this.employeeServiceRepository.delete(id);
  }

  @MainTransactional()
  async listPaginated(dto: FilterEmployeeServiceDto) {
    return this.employeeServiceRepository.findPaginated(dto);
  }

  @MainTransactional()
  async require(id: string) {
    const employeeService =
      await this.employeeServiceRepository.findFirstById(id);
    if (!employeeService) {
      throw EmployeeServiceExceptions.employeeServiceNotFound([
        { field: 'employeeServiceId', issue: `not found with value '${id}'` },
      ]);
    }
    return employeeService;
  }

  @MainTransactional()
  async syncForEmployee(employeeId: string, catalogItemIds: string[]) {
    await this.employeeReadService.require(employeeId);

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
