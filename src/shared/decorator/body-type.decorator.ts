import { applyDecorators } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { type ZodType } from 'zod';

export function BodyType(type: ZodType) {
  return applyDecorators(
    ApiBody({
      schema: type.toJSONSchema({
        reused: 'inline',
        cycles: 'ref',
        unrepresentable: 'any',
        io: 'input',
        target: 'draft-2020-12',
      }) as never,
      required: true,
    }),
  );
}
