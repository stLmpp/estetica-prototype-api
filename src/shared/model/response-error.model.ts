import { ApiProperty } from '@nestjs/swagger';

export class ErrorDetailModel {
  constructor(issue: string, field: string) {
    this.issue = issue;
    this.field = field;
  }

  @ApiProperty({
    description: 'The specific issue related to the error',
    example: 'Invalid email format',
    minLength: 1,
    maxLength: 1024,
  })
  readonly issue: string;

  @ApiProperty({
    description: 'The field where the error occurred',
    example: 'email',
    minLength: 1,
    maxLength: 1024,
  })
  readonly field: string;
}

export class ErrorModel {
  constructor(
    code: string,
    message: string,
    error: string,
    details?: ErrorDetailModel[],
  ) {
    this.code = code;
    this.message = message;
    this.error = error;
    this.details = details;
  }

  @ApiProperty({
    description: 'The error code',
    example: 'INVALID_EMAIL_FORMAT',
    minLength: 2,
    maxLength: 64,
  })
  readonly code: string;

  @ApiProperty({
    description: 'The error message',
    example: 'Invalid email format',
    minLength: 1,
    maxLength: 1024,
  })
  readonly message: string;

  @ApiProperty({
    description: 'The error description',
    minLength: 1,
    maxLength: 1024,
  })
  readonly error: string;

  @ApiProperty({
    type: [ErrorDetailModel],
    required: false,
    description: 'The details of the error',
  })
  readonly details?: ErrorDetailModel[];
}

export class ResponseErrorModel extends Error {
  constructor(error: ErrorModel, status: number) {
    super(error.message);
    this.error = error;
    this.statusCode = status;
  }

  @ApiProperty({
    description: 'The error object',
  })
  readonly error: ErrorModel;

  @ApiProperty({
    description: 'The HTTP status code',
    example: 400,
    minimum: 400,
    maximum: 599,
  })
  readonly statusCode: number;

  toJSON() {
    return {
      error: this.error,
      statusCode: this.statusCode,
    };
  }
}
