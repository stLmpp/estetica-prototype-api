import { Injectable } from '@nestjs/common';
import { InferSelectModel } from 'drizzle-orm';
import { AnamnesisSectionRepository } from '../../database/main/repositories/anamnesis-section.repository';
import { mainEntities } from '../../database/main/main-entities';
import { CreateAnamnesisSectionDto } from './dto/input/create-anamnesis-section.request';
import { UpdateAnamnesisSectionDto } from './dto/input/update-anamnesis-section.request';
import { MainTransactional } from '../../database/main/main-database-connection';
import { AnamnesisFieldExceptions } from './anamnesis-field-exceptions';
import { AnamnesisFormService } from './anamnesis-form.service';
import { type AnamnesisSectionModel } from './model/anamnesis-section.model';

@Injectable()
export class AnamnesisSectionService {
  constructor(
    private readonly anamnesisSectionRepository: AnamnesisSectionRepository,
    private readonly anamnesisFormService: AnamnesisFormService,
  ) {}

  @MainTransactional()
  async create(formId: string, dto: CreateAnamnesisSectionDto) {
    await this.anamnesisFormService.require(formId);
    const entity = await this.anamnesisSectionRepository.insert({
      anamnesisFormId: formId,
      label: dto.label,
      active: dto.active,
      displayOrder: dto.displayOrder,
    });
    return this.mapEntityToDto(entity);
  }

  @MainTransactional()
  async update(formId: string, id: string, dto: UpdateAnamnesisSectionDto) {
    await this.require(formId, id);
    await this.anamnesisSectionRepository.update(id, dto);
  }

  @MainTransactional()
  async delete(formId: string, id: string) {
    await this.require(formId, id);
    await this.anamnesisSectionRepository.delete(id);
  }

  @MainTransactional()
  async listByForm(formId: string) {
    await this.anamnesisFormService.require(formId);
    const entities =
      await this.anamnesisSectionRepository.findByAnamnesisFormId(formId);
    return entities.map((entity) => this.mapEntityToDto(entity));
  }

  @MainTransactional()
  async require(formId: string, id: string) {
    const entity = await this.anamnesisSectionRepository.findFirstById(id);
    if (!entity || entity.anamnesisFormId !== formId) {
      throw AnamnesisFieldExceptions.anamnesisSectionNotFound([
        { field: 'anamnesisSectionId', issue: `not found with value '${id}'` },
      ]);
    }
    return entity;
  }

  private mapEntityToDto(
    entity: InferSelectModel<typeof mainEntities.anamnesisSection>,
  ): AnamnesisSectionModel {
    return {
      id: entity.id,
      anamnesisFormId: entity.anamnesisFormId,
      label: entity.label,
      displayOrder: entity.displayOrder,
      active: entity.active,
    };
  }
}
