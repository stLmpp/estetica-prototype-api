import { type Type } from '@nestjs/common';

export function getClazz<T>(): Type<T> {
  return class {} as Type<T>;
}
