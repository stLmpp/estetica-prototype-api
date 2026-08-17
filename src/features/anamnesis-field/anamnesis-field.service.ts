import { Injectable } from '@nestjs/common';
import { InferSelectModel } from 'drizzle-orm';
import { AnamnesisFieldRepository } from '../../database/main/repositories/anamnesis-field.repository';
import { AnamnesisSectionRepository } from '../../database/main/repositories/anamnesis-section.repository';
import { AnamnesisFieldValidationRepository } from '../../database/main/repositories/anamnesis-field-validation.repository';
import { mainEntities } from '../../database/main/main-entities';
import { CreateAnamnesisFieldDto } from './dto/input/create-anamnesis-field.request';
import { UpdateAnamnesisFieldDto } from './dto/input/update-anamnesis-field.request';
import { FilterAnamnesisFieldDto } from './dto/input/list-anamnesis-field.request';
import { MainTransactional } from '../../database/main/main-database-connection';
import { AnamnesisFieldExceptions } from './anamnesis-field-exceptions';
import { AnamnesisFormService } from './anamnesis-form.service';
import { AnamnesisFieldReadService } from './anamnesis-field-read.service';
import { type AnamnesisFieldValidationInput } from './model/anamnesis-field-validation.model';
import { type AnamnesisFieldModel } from './model/anamnesis-field.model';

@Injectable()
export class AnamnesisFieldService {
  constructor(
    private readonly anamnesisFieldRepository: AnamnesisFieldRepository,
    private readonly anamnesisSectionRepository: AnamnesisSectionRepository,
    private readonly anamnesisFieldValidationRepository: AnamnesisFieldValidationRepository,
    private readonly anamnesisFormService: AnamnesisFormService,
    private readonly anamnesisFieldReadService: AnamnesisFieldReadService,
  ) {}

  @MainTransactional()
  async create(dto: CreateAnamnesisFieldDto): Promise<AnamnesisFieldModel> {
    await this.anamnesisFormService.require(dto.anamnesisFormId);
    await this.assertSectionBelongsToForm(
      dto.anamnesisFormId,
      dto.anamnesisSectionId,
    );
    const entity = await this.anamnesisFieldRepository.insert({
      anamnesisFormId: dto.anamnesisFormId,
      anamnesisSectionId: dto.anamnesisSectionId,
      fieldType: dto.fieldType,
      fieldArgs: dto.fieldArgs,
      label: dto.label,
      extraLabels: dto.extraLabels,
      active: dto.active,
      displayOrder: dto.displayOrder,
    });
    const validations =
      await this.anamnesisFieldValidationRepository.insertMany(
        dto.validations.map((validation) => ({
          anamnesisFieldId: entity.id,
          validationType: validation.validationType,
          validationArgs: validation.validationArgs,
          active: validation.active ?? true,
        })),
      );
    return {
      ...this.mapEntityToDto(entity),
      validations: validations.map((validation) => ({
        id: validation.id,
        validationType: validation.validationType,
        validationArgs: validation.validationArgs ?? undefined,
        active: validation.active,
      })),
    };
  }

  @MainTransactional()
  async update(id: string, dto: UpdateAnamnesisFieldDto) {
    const field = await this.anamnesisFieldReadService.require(id);
    if (dto.anamnesisSectionId !== undefined) {
      await this.assertSectionBelongsToForm(
        field.anamnesisFormId,
        dto.anamnesisSectionId,
      );
    }
    const { validations, ...rest } = dto;
    await this.anamnesisFieldRepository.update(id, rest);
    if (validations !== undefined) {
      await this.syncValidations(id, validations);
    }
  }

  @MainTransactional()
  async delete(id: string) {
    await this.anamnesisFieldReadService.require(id);
    await this.anamnesisFieldRepository.delete(id);
  }

  @MainTransactional()
  async listPaginated(dto: FilterAnamnesisFieldDto) {
    const { anamnesisFields, count } =
      await this.anamnesisFieldRepository.findPaginated(dto);
    return {
      anamnesisFields: anamnesisFields.map((entity) =>
        this.mapEntityToDto(entity),
      ),
      count,
    };
  }

  private async syncValidations(
    anamnesisFieldId: string,
    validations: AnamnesisFieldValidationInput[],
  ) {
    const existing =
      await this.anamnesisFieldValidationRepository.findByAnamnesisFieldId(
        anamnesisFieldId,
      );
    await this.anamnesisFieldValidationRepository.deleteMany(
      existing.map((validation) => validation.id),
    );
    await this.anamnesisFieldValidationRepository.insertMany(
      validations.map((validation) => ({
        anamnesisFieldId,
        validationType: validation.validationType,
        validationArgs: validation.validationArgs,
        active: validation.active ?? true,
      })),
    );
  }

  private async assertSectionBelongsToForm(
    formId: string,
    sectionId: string | null | undefined,
  ) {
    if (!sectionId) {
      return;
    }
    const section =
      await this.anamnesisSectionRepository.findFirstById(sectionId);
    if (!section || section.anamnesisFormId !== formId) {
      throw AnamnesisFieldExceptions.anamnesisFieldSectionFormMismatch([
        {
          field: 'anamnesisSectionId',
          issue: `does not belong to form '${formId}'`,
        },
      ]);
    }
  }

  private mapEntityToDto(
    entity: InferSelectModel<typeof mainEntities.anamnesisField>,
  ): AnamnesisFieldModel {
    return {
      id: entity.id,
      anamnesisFormId: entity.anamnesisFormId,
      anamnesisSectionId: entity.anamnesisSectionId ?? undefined,
      fieldType: entity.fieldType,
      fieldArgs: entity.fieldArgs ?? undefined,
      label: entity.label,
      extraLabels: entity.extraLabels ?? undefined,
      active: entity.active,
      displayOrder: entity.displayOrder,
    };
  }
}
