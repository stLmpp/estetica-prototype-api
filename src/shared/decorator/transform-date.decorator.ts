import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';
import dayjs from 'dayjs';

export function TransformDate() {
  return applyDecorators(
    Transform(({ value }) => {
      const dateValue = dayjs(
        String(value),
        ['YYYY-MM-DD[T]HH:mm:ss.SSS[Z]', 'YYYY-MM-DD'],
        true,
      );
      if (!dateValue.isValid()) {
        return value as never;
      }
      return dateValue.toDate();
    }),
  );
}
