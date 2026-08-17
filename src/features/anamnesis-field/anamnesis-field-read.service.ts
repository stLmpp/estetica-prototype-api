import { Injectable } from '@nestjs/common';
import { InferSelectModel } from 'drizzle-orm';
import { AnamnesisFormRepository } from '../../database/main/repositories/anamnesis-form.repository';
import { AnamnesisFieldRepository } from '../../database/main/repositories/anamnesis-field.repository';
import { mainEntities } from '../../database/main/main-entities';
import { AnamnesisFieldExceptions } from './anamnesis-field-exceptions';
import { MainTransactional } from '../../database/main/main-database-connection';
import {
  type AnamnesisFieldModel,
  AnamnesisFieldArgsSchema,
  AnamnesisFieldExtraLabelsSchema,
} from './model/anamnesis-field.model';
import { AnamnesisFieldValidationArgsSchema } from './model/anamnesis-field-validation.model';

@Injectable()
export class AnamnesisFieldReadService {
  constructor(
    private readonly anamnesisFormRepository: AnamnesisFormRepository,
    private readonly anamnesisFieldRepository: AnamnesisFieldRepository,
  ) {}

  @MainTransactional()
  async require(id: string) {
    const anamnesisField =
      await this.anamnesisFieldRepository.findFirstById(id);
    if (!anamnesisField) {
      throw AnamnesisFieldExceptions.anamnesisFieldNotFound([
        { field: 'anamnesisFieldId', issue: `not found with value '${id}'` },
      ]);
    }
    return this.mapEntityToDto(anamnesisField);
  }

  @MainTransactional()
  async requireWithValidations(id: string) {
    const anamnesisField =
      await this.anamnesisFieldRepository.findFirstByIdWithValidations(id);
    if (!anamnesisField) {
      throw AnamnesisFieldExceptions.anamnesisFieldNotFound([
        { field: 'anamnesisFieldId', issue: `not found with value '${id}'` },
      ]);
    }
    return {
      ...this.mapEntityToDto(anamnesisField),
      validations: anamnesisField.anamnesisFieldValidations.map(
        mapAnamnesisFieldValidationEntityToDto,
      ),
    };
  }

  @MainTransactional()
  async requireForm(formId: string) {
    const anamnesisForm =
      await this.anamnesisFormRepository.findFirstById(formId);
    if (!anamnesisForm || !anamnesisForm.active) {
      throw AnamnesisFieldExceptions.anamnesisFormNotFound([
        {
          field: 'anamnesisFormId',
          issue: `not found or inactive with value '${formId}'`,
        },
      ]);
    }
    return anamnesisForm;
  }

  @MainTransactional()
  async requireManyActiveWithValidations(ids: string[], formId: string) {
    const uniqueIds = [...new Set(ids)];
    const anamnesisFields =
      await this.anamnesisFieldRepository.findManyActiveByIdsWithActiveValidations(
        uniqueIds,
      );
    const missingOrMismatched = uniqueIds.filter(
      (id) =>
        !anamnesisFields.some(
          (field) => field.id === id && field.anamnesisFormId === formId,
        ),
    );
    if (missingOrMismatched.length) {
      throw AnamnesisFieldExceptions.anamnesisFieldInactiveReference(
        missingOrMismatched.map((id) => ({
          field: 'anamnesisFieldId',
          issue: `missing, inactive, or not part of form '${formId}': '${id}'`,
        })),
      );
    }
    return anamnesisFields.filter((field) => field.anamnesisFormId === formId);
  }

  private mapEntityToDto(
    entity: InferSelectModel<typeof mainEntities.anamnesisField>,
  ): AnamnesisFieldModel {
    return {
      id: entity.id,
      anamnesisFormId: entity.anamnesisFormId,
      anamnesisSectionId: entity.anamnesisSectionId ?? undefined,
      fieldType: entity.fieldType,
      fieldArgs: entity.fieldArgs
        ? AnamnesisFieldArgsSchema.parse(entity.fieldArgs)
        : undefined,
      label: entity.label,
      extraLabels: entity.extraLabels
        ? AnamnesisFieldExtraLabelsSchema.parse(entity.extraLabels)
        : undefined,
      active: entity.active,
      displayOrder: entity.displayOrder,
    };
  }
}

export function mapAnamnesisFieldValidationEntityToDto(
  entity: InferSelectModel<typeof mainEntities.anamnesisFieldValidation>,
) {
  return {
    id: entity.id,
    validationType: entity.validationType,
    validationArgs: entity.validationArgs
      ? AnamnesisFieldValidationArgsSchema.parse(entity.validationArgs)
      : undefined,
    active: entity.active,
  };
}
