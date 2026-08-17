import { Injectable } from '@nestjs/common';
import { InferSelectModel } from 'drizzle-orm';
import { AnamnesisFormRepository } from '../../database/main/repositories/anamnesis-form.repository';
import { mainEntities } from '../../database/main/main-entities';
import { CreateAnamnesisFormDto } from './dto/input/create-anamnesis-form.request';
import { UpdateAnamnesisFormDto } from './dto/input/update-anamnesis-form.request';
import { FilterAnamnesisFormDto } from './dto/input/list-anamnesis-form.request';
import { MainTransactional } from '../../database/main/main-database-connection';
import { AnamnesisFieldExceptions } from './anamnesis-field-exceptions';
import { type AnamnesisFormModel } from './model/anamnesis-form.model';

@Injectable()
export class AnamnesisFormService {
  constructor(
    private readonly anamnesisFormRepository: AnamnesisFormRepository,
  ) {}

  @MainTransactional()
  async create(dto: CreateAnamnesisFormDto) {
    const entity = await this.anamnesisFormRepository.insert({
      name: dto.name,
      description: dto.description,
      active: dto.active,
      displayOrder: dto.displayOrder,
    });
    return this.mapEntityToDto(entity);
  }

  @MainTransactional()
  async update(id: string, dto: UpdateAnamnesisFormDto) {
    await this.require(id);
    await this.anamnesisFormRepository.update(id, dto);
  }

  @MainTransactional()
  async delete(id: string) {
    await this.require(id);
    await this.anamnesisFormRepository.delete(id);
  }

  @MainTransactional()
  async listPaginated(dto: FilterAnamnesisFormDto) {
    const { anamnesisForms, count } =
      await this.anamnesisFormRepository.findPaginated(dto);
    return {
      anamnesisForms: anamnesisForms.map((entity) =>
        this.mapEntityToDto(entity),
      ),
      count,
    };
  }

  @MainTransactional()
  async getById(id: string) {
    const entity = await this.require(id);
    return this.mapEntityToDto(entity);
  }

  @MainTransactional()
  async require(id: string) {
    const entity = await this.anamnesisFormRepository.findFirstById(id);
    if (!entity) {
      throw AnamnesisFieldExceptions.anamnesisFormNotFound([
        { field: 'anamnesisFormId', issue: `not found with value '${id}'` },
      ]);
    }
    return entity;
  }

  private mapEntityToDto(
    entity: InferSelectModel<typeof mainEntities.anamnesisForm>,
  ): AnamnesisFormModel {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description ?? undefined,
      active: entity.active,
      displayOrder: entity.displayOrder,
    };
  }
}
