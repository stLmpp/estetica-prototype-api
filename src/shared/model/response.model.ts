import { type Class } from 'type-fest';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsString, ValidateNested } from 'class-validator';

export function ResponseModel<T extends Class<any>>(clazz: T) {
  class Response {
    constructor(data: InstanceType<T>) {
      this.data = data;
    }

    @ApiProperty({ type: clazz })
    @Type(() => clazz)
    @ValidateNested()
    data: InstanceType<T>;
  }
  return Response;
}

export function ResponsePaginatedModel<T extends Class<any>>(clazz: T) {
  class ResponseData {
    @ApiProperty({ type: clazz, isArray: true })
    @Type(() => clazz)
    @ValidateNested({ each: true })
    items!: T[];
  }

  class Response {
    constructor(items: T[], pagination: PaginationMetadataModel) {
      this.data = { items };
      this.meta = pagination;
    }

    @ApiProperty({ type: ResponseData })
    @Type(() => ResponseData)
    @ValidateNested()
    data: ResponseData;

    @ApiProperty({ type: PaginationMetadataModel })
    @Type(() => PaginationMetadataModel)
    @ValidateNested()
    meta: PaginationMetadataModel;
  }

  return Response;
}

export class PaginationMetadataModel {
  @ApiProperty()
  @IsNumber()
  readonly total!: number;

  @ApiProperty()
  @IsNumber()
  readonly page!: number;

  @ApiProperty()
  @IsNumber()
  readonly limit!: number;
}

export class ErrorDetailModel {
  constructor(issue: string, field: string) {
    this.issue = issue;
    this.field = field;
  }

  @ApiProperty()
  @IsString()
  readonly issue: string;

  @ApiProperty()
  @IsString()
  readonly field: string;
}

export class ErrorModel {
  constructor(code: string, message: string, details?: ErrorDetailModel[]) {
    this.code = code;
    this.message = message;
    this.details = details;
  }

  @ApiProperty()
  @IsString()
  readonly code: string;

  @ApiProperty()
  @IsString()
  readonly message: string;

  @ApiProperty({ type: ErrorDetailModel, isArray: true })
  @Type(() => ErrorDetailModel)
  @ValidateNested({ each: true })
  readonly details?: ErrorDetailModel[];
}

export class ResponseErrorModel {
  constructor(error: ErrorModel) {
    this.error = error;
  }

  @ApiProperty({ type: ErrorModel })
  @Type(() => ErrorModel)
  @ValidateNested()
  readonly error: ErrorModel;
}
