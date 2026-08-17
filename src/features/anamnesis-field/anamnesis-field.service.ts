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

interface FieldContent {
  anamnesisSectionId?: string | null;
  fieldType: CreateAnamnesisFieldDto['fieldType'];
  fieldArgs?: CreateAnamnesisFieldDto['fieldArgs'] | null;
  label: string;
  extraLabels?: CreateAnamnesisFieldDto['extraLabels'] | null;
  active: boolean;
  displayOrder: number;
  validations: AnamnesisFieldValidationInput[];
}

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
    return this.insertVersion(dto.anamnesisFormId, dto, null);
  }

  /**
   * Fields are never edited in place — see `AnamnesisSectionService.update`
   * for the same reasoning, one level down: a changed fieldType/fieldArgs/
   * label would retroactively change how every past answer referencing this
   * field id reads. Editing always supersedes: the current row is
   * deactivated and a new row is inserted carrying `previousVersionId`.
   */
  @MainTransactional()
  async update(
    id: string,
    dto: UpdateAnamnesisFieldDto,
  ): Promise<AnamnesisFieldModel> {
    const field = await this.anamnesisFieldReadService.require(id);
    if (await this.anamnesisFieldRepository.hasSuccessor(id)) {
      throw AnamnesisFieldExceptions.anamnesisFieldAlreadySuperseded([
        { field: 'anamnesisFieldId', issue: `'${id}' is a superseded version` },
      ]);
    }
    await this.assertSectionBelongsToForm(
      field.anamnesisFormId,
      dto.anamnesisSectionId,
    );
    await this.anamnesisFieldRepository.update(id, { active: false });
    return this.insertVersion(field.anamnesisFormId, dto, id);
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

  private async insertVersion(
    anamnesisFormId: string,
    content: FieldContent,
    previousVersionId: string | null,
  ): Promise<AnamnesisFieldModel> {
    const entity = await this.anamnesisFieldRepository.insert({
      anamnesisFormId,
      anamnesisSectionId: content.anamnesisSectionId,
      fieldType: content.fieldType,
      fieldArgs: content.fieldArgs,
      label: content.label,
      extraLabels: content.extraLabels,
      active: content.active,
      displayOrder: content.displayOrder,
      previousVersionId,
    });
    const validations =
      await this.anamnesisFieldValidationRepository.insertMany(
        content.validations.map((validation) => ({
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
      previousVersionId: entity.previousVersionId ?? undefined,
    };
  }
}
