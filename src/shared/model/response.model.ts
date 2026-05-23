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
    items!: InstanceType<T>[];
  }

  class Response {
    constructor(items: InstanceType<T>[], pagination: PaginationMetadataModel) {
      this.data = { items };
      this.meta = PaginationMetadataModel.from(pagination);
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
  constructor(total: number, page: number, limit: number) {
    this.total = total;
    this.page = page;
    this.limit = limit;
  }

  @ApiProperty()
  @IsNumber()
  readonly total: number;

  @ApiProperty()
  @IsNumber()
  readonly page: number;

  @ApiProperty()
  @IsNumber()
  readonly limit: number;

  static from({ total, limit, page }: PaginationMetadataModel) {
    return new PaginationMetadataModel(total, page, limit);
  }
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

export class ResponseErrorModel extends Error {
  constructor(error: ErrorModel, status: number) {
    super(error.message);
    this.error = error;
    this.statusCode = status;
  }

  @ApiProperty({ type: ErrorModel })
  @Type(() => ErrorModel)
  @ValidateNested()
  readonly error: ErrorModel;

  @ApiProperty({ example: 400 })
  @Type(() => Number)
  @IsNumber()
  readonly statusCode: number;

  toJSON() {
    return {
      statusCode: this.statusCode,
      error: this.error,
    };
  }
}
