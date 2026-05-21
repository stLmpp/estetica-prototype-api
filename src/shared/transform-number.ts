import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';

export function TransformNumber() {
  return applyDecorators(
    Transform(({ value }) => {
      const numberValue = Number(value);
      if (Number.isNaN(numberValue)) {
        return value as never;
      }
      return numberValue;
    }),
  );
}
