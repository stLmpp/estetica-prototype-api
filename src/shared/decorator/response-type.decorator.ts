import { applyDecorators, SetMetadata } from '@nestjs/common';
import { type Class } from 'type-fest';

export const RESPONSE_TYPE_METADATA_KEY = 'app:res:metadata';

export interface ResponseTypeMetadata {
  type: Class<any>;
  isArray: boolean;
}

export function ResponseType(type: Class<any>, isArray = false) {
  return applyDecorators(
    SetMetadata(RESPONSE_TYPE_METADATA_KEY, {
      isArray,
      type,
    } satisfies ResponseTypeMetadata),
  );
}
