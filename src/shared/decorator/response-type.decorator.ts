import { type ZodDto, ZodSerializerDto } from 'nestjs-zod';
import { applyDecorators, HttpCode } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

export function ResponseType(schema: ZodDto | [ZodDto], status = 200) {
  const decorators: Array<
    ClassDecorator | MethodDecorator | PropertyDecorator
  > = [
    ZodSerializerDto(schema),
    ApiResponse({
      type: (Array.isArray(schema)
        ? schema.map((s) => s.Output)
        : schema.Output) as never,
      status,
    }),
  ];
  if (status) {
    decorators.push(HttpCode(status));
  }
  return applyDecorators(...decorators);
}
