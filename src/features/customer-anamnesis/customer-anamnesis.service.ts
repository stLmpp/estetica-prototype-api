import { Injectable } from '@nestjs/common';
import { CustomerAnamnesisRepository } from '../../database/main/repositories/customer-anamnesis.repository';
import { CustomerAnamnesisFieldRepository } from '../../database/main/repositories/customer-anamnesis-field.repository';
import { CustomerReadService } from '../customer/customer-read.service';
import { AppointmentReadService } from '../appointment/appointment-read.service';
import { AnamnesisFieldReadService } from '../anamnesis-field/anamnesis-field-read.service';
import { CustomerAnamnesisExceptions } from './customer-anamnesis-exceptions';
import { MainTransactional } from '../../database/main/main-database-connection';
import { CustomerAnamnesisStatus } from '../../shared/domain/customer-anamnesis-status.enum';
import { AnamnesisFieldType } from '../../shared/domain/anamnesis-field.type';
import { AnamnesisFieldValidationType } from '../../shared/domain/anamnesis-field-validation.enum';
import { type CreateCustomerAnamnesisDto } from './dto/input/create-customer-anamnesis.request';
import { type UpdateCustomerAnamnesisDto } from './dto/input/update-customer-anamnesis.request';
import { type FinalizeCustomerAnamnesisDto } from './dto/input/finalize-customer-anamnesis.request';
import { type FilterCustomerAnamnesisDto } from './dto/input/list-customer-anamnesis.request';
import { type CustomerAnamnesisAnswerInput } from './model/customer-anamnesis-answer-input.model';
import { type CustomerAnamnesisModel } from './model/customer-anamnesis.model';
import { type ErrorDetailModel } from '../../shared/model/response-error.model';
import { type InferSelectModel } from 'drizzle-orm';
import { type mainEntities } from '../../database/main/main-entities';

type AnamnesisFieldWithValidations = Awaited<
  ReturnType<AnamnesisFieldReadService['requireManyActiveWithValidations']>
>[number];

@Injectable()
export class CustomerAnamnesisService {
  constructor(
    private readonly customerAnamnesisRepository: CustomerAnamnesisRepository,
    private readonly customerAnamnesisFieldRepository: CustomerAnamnesisFieldRepository,
    private readonly customerReadService: CustomerReadService,
    private readonly appointmentReadService: AppointmentReadService,
    private readonly anamnesisFieldReadService: AnamnesisFieldReadService,
  ) {}

  @MainTransactional()
  async create(
    customerId: string,
    dto: CreateCustomerAnamnesisDto,
  ): Promise<CustomerAnamnesisModel> {
    await this.customerReadService.require(customerId);

    if (dto.appointmentId) {
      const appointment = await this.appointmentReadService.require(
        dto.appointmentId,
      );
      if (appointment.customerId !== customerId) {
        throw CustomerAnamnesisExceptions.customerAnamnesisAppointmentMismatch([
          {
            field: 'appointmentId',
            issue: `appointment '${dto.appointmentId}' does not belong to customer '${customerId}'`,
          },
        ]);
      }
    }

    await this.anamnesisFieldReadService.requireForm(dto.anamnesisFormId);
    const fields = await this.requireFieldsForAnswers(
      dto.answers,
      dto.anamnesisFormId,
    );
    this.assertAnswersValid(dto.answers, fields);

    const entity = await this.customerAnamnesisRepository.insert({
      customerId,
      anamnesisFormId: dto.anamnesisFormId,
      appointmentId: dto.appointmentId,
      date: dto.date ?? new Date(),
      status: CustomerAnamnesisStatus.DRAFT,
    });
    await this.customerAnamnesisFieldRepository.insertMany(
      dto.answers.map((answer) => ({
        customerAnamnesisId: entity.id,
        anamnesisFieldId: answer.anamnesisFieldId,
        value: answer.value,
        extraValues: answer.extraValues,
      })),
    );

    return this.getById(customerId, entity.id);
  }

  @MainTransactional()
  async update(
    customerId: string,
    id: string,
    dto: UpdateCustomerAnamnesisDto,
  ) {
    const record = await this.require(customerId, id);
    if (record.status === CustomerAnamnesisStatus.FINALIZED) {
      throw CustomerAnamnesisExceptions.customerAnamnesisAlreadyFinalized([
        {
          field: 'status',
          issue: 'record is finalized and can no longer be edited',
        },
      ]);
    }

    if (dto.answers !== undefined) {
      const fields = await this.requireFieldsForAnswers(
        dto.answers,
        record.anamnesisFormId,
      );
      this.assertAnswersValid(dto.answers, fields);
      await this.customerAnamnesisFieldRepository.deleteAllByCustomerAnamnesisId(
        id,
      );
      await this.customerAnamnesisFieldRepository.insertMany(
        dto.answers.map((answer) => ({
          customerAnamnesisId: id,
          anamnesisFieldId: answer.anamnesisFieldId,
          value: answer.value,
          extraValues: answer.extraValues,
        })),
      );
    }

    if (dto.date !== undefined) {
      await this.customerAnamnesisRepository.update(id, { date: dto.date });
    }
  }

  @MainTransactional()
  async finalize(
    customerId: string,
    id: string,
    dto: FinalizeCustomerAnamnesisDto,
  ): Promise<CustomerAnamnesisModel> {
    const record = await this.require(customerId, id);
    if (record.status !== CustomerAnamnesisStatus.FINALIZED) {
      await this.customerAnamnesisRepository.update(id, {
        status: CustomerAnamnesisStatus.FINALIZED,
        signedByName: dto.signedByName,
        signedAt: new Date(),
      });
    }
    return this.getById(customerId, id);
  }

  @MainTransactional()
  async delete(customerId: string, id: string) {
    await this.require(customerId, id);
    await this.customerAnamnesisRepository.delete(id);
  }

  @MainTransactional()
  async listPaginated(customerId: string, dto: FilterCustomerAnamnesisDto) {
    await this.customerReadService.require(customerId);
    const { customerAnamnesisRecords, count } =
      await this.customerAnamnesisRepository.findPaginated(customerId, dto);
    return {
      customerAnamnesisRecords: customerAnamnesisRecords.map((entity) =>
        this.mapEntityToDto(entity),
      ),
      count,
    };
  }

  @MainTransactional()
  async getById(
    customerId: string,
    id: string,
  ): Promise<CustomerAnamnesisModel> {
    const record = await this.require(customerId, id);
    const answers =
      await this.customerAnamnesisFieldRepository.findByCustomerAnamnesisId(id);
    return {
      ...this.mapEntityToDto(record),
      answers: answers.map((answer) => ({
        id: answer.id,
        anamnesisFieldId: answer.anamnesisFieldId,
        value: answer.value,
        extraValues: answer.extraValues ?? undefined,
        anamnesisFieldLabel: answer.anamnesisField?.label,
        anamnesisFieldType: answer.anamnesisField?.fieldType,
        anamnesisFieldOptions: answer.anamnesisField?.fieldArgs?.options,
        anamnesisSectionId: answer.anamnesisField?.anamnesisSection?.id,
        anamnesisSectionLabel: answer.anamnesisField?.anamnesisSection?.label,
      })),
    };
  }

  private async require(customerId: string, id: string) {
    const record = await this.customerAnamnesisRepository.findFirstById(id);
    if (!record || record.customerId !== customerId) {
      throw CustomerAnamnesisExceptions.customerAnamnesisNotFound([
        { field: 'customerAnamnesisId', issue: `not found with value '${id}'` },
      ]);
    }
    return record;
  }

  private async requireFieldsForAnswers(
    answers: CustomerAnamnesisAnswerInput[],
    anamnesisFormId: string,
  ): Promise<Map<string, AnamnesisFieldWithValidations>> {
    const fieldIds = answers.map((answer) => answer.anamnesisFieldId);
    const fields =
      await this.anamnesisFieldReadService.requireManyActiveWithValidations(
        fieldIds,
        anamnesisFormId,
      );
    return new Map(fields.map((field) => [field.id, field]));
  }

  private assertAnswersValid(
    answers: CustomerAnamnesisAnswerInput[],
    fields: Map<string, AnamnesisFieldWithValidations>,
  ) {
    const details: ErrorDetailModel[] = [];
    for (const answer of answers) {
      const field = fields.get(answer.anamnesisFieldId)!;
      details.push(...this.checkStructural(field, answer));
      for (const rule of field.anamnesisFieldValidations) {
        const issue = this.checkRule(field, rule, answer);
        if (issue) {
          details.push({
            field: `answers.${answer.anamnesisFieldId}`,
            issue,
          });
        }
      }
    }
    if (details.length) {
      throw CustomerAnamnesisExceptions.customerAnamnesisAnswerInvalid(details);
    }
  }

  private checkStructural(
    field: AnamnesisFieldWithValidations,
    answer: CustomerAnamnesisAnswerInput,
  ): ErrorDetailModel[] {
    const details: ErrorDetailModel[] = [];
    const fieldPath = `answers.${answer.anamnesisFieldId}`;
    const optionValues = new Set(
      field.fieldArgs?.options.map((option) => option.value) ?? [],
    );
    switch (field.fieldType) {
      case AnamnesisFieldType.RADIO:
      case AnamnesisFieldType.SELECT: {
        if (answer.value && !optionValues.has(answer.value)) {
          details.push({
            field: fieldPath,
            issue: 'value is not one of the configured options',
          });
        }
        break;
      }
      case AnamnesisFieldType.CHECKBOX: {
        const values = answer.extraValues?.values ?? [];
        if (values.some((value) => !optionValues.has(value))) {
          details.push({
            field: fieldPath,
            issue:
              'extraValues contains a value that is not one of the configured options',
          });
        }
        break;
      }
      case AnamnesisFieldType.BOOLEAN: {
        if (
          answer.value &&
          answer.value !== 'true' &&
          answer.value !== 'false'
        ) {
          details.push({
            field: fieldPath,
            issue: "value must be 'true' or 'false'",
          });
        }
        break;
      }
      default: {
        break;
      }
    }
    return details;
  }

  private checkRule(
    field: AnamnesisFieldWithValidations,
    rule: AnamnesisFieldWithValidations['anamnesisFieldValidations'][number],
    answer: CustomerAnamnesisAnswerInput,
  ): string | null {
    switch (rule.validationType) {
      case AnamnesisFieldValidationType.REQUIRED: {
        const isEmpty =
          field.fieldType === AnamnesisFieldType.CHECKBOX
            ? !answer.extraValues?.values.length
            : !answer.value;
        return isEmpty ? 'is required' : null;
      }
      case AnamnesisFieldValidationType.MIN_LENGTH: {
        const length = (rule.validationArgs as { length: number } | null)
          ?.length;
        return length !== undefined && answer.value.length < length
          ? `must be at least ${length} characters long`
          : null;
      }
      case AnamnesisFieldValidationType.MAX_LENGTH: {
        const length = (rule.validationArgs as { length: number } | null)
          ?.length;
        return length !== undefined && answer.value.length > length
          ? `must be at most ${length} characters long`
          : null;
      }
      case AnamnesisFieldValidationType.MIN_VALUE: {
        const value = (rule.validationArgs as { value: number } | null)?.value;
        return value !== undefined &&
          answer.value !== '' &&
          Number(answer.value) < value
          ? `must be at least ${value}`
          : null;
      }
      case AnamnesisFieldValidationType.MAX_VALUE: {
        const value = (rule.validationArgs as { value: number } | null)?.value;
        return value !== undefined &&
          answer.value !== '' &&
          Number(answer.value) > value
          ? `must be at most ${value}`
          : null;
      }
      case AnamnesisFieldValidationType.PATTERN: {
        const pattern = (rule.validationArgs as { pattern: string } | null)
          ?.pattern;
        return pattern &&
          answer.value !== '' &&
          !new RegExp(pattern).test(answer.value)
          ? `does not match the required pattern`
          : null;
      }
      default: {
        return null;
      }
    }
  }

  private mapEntityToDto(
    entity: InferSelectModel<typeof mainEntities.customerAnamnesis>,
  ): CustomerAnamnesisModel {
    return {
      id: entity.id,
      customerId: entity.customerId,
      anamnesisFormId: entity.anamnesisFormId,
      appointmentId: entity.appointmentId ?? undefined,
      date: entity.date,
      status: entity.status,
      signedByName: entity.signedByName ?? undefined,
      signedAt: entity.signedAt ?? undefined,
    };
  }
}
