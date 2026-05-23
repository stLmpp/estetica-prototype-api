import {
  type ArgumentMetadata,
  HttpStatus,
  Optional,
  Paramtype,
  PipeTransform,
  Type,
  type ValidationError,
} from '@nestjs/common';
import {
  ClassTransformOptions,
  instanceToPlain,
  plainToInstance,
} from 'class-transformer';
import { validate, ValidatorOptions } from 'class-validator';
import { isTypedArray } from 'util/types';
import { coreExceptions } from '../core-exceptions';
import { ExceptionFactoryWithoutError } from '../../shared/exception/exception';
import { mapValidationErrorsToErrorDetails } from '../../shared/utils/map-validation-errors-to-error.details';

const BUILT_IN_TYPES = [Date, RegExp, Error, Map, Set, WeakMap, WeakSet];
const BUILT_IN_TYPES_SET: ReadonlySet<unknown> = new Set(BUILT_IN_TYPES);

export interface ValidationPipeOptions extends ValidatorOptions {
  transform?: boolean;
  disableErrorMessages?: boolean;
  transformOptions?: ClassTransformOptions;
  validateCustomDecorators?: boolean;
  expectedType?: Type;
}

export class CustomValidationPipe implements PipeTransform {
  constructor(@Optional() options: ValidationPipeOptions) {
    const {
      transform,
      disableErrorMessages,
      expectedType,
      transformOptions,
      validateCustomDecorators,
      ...validatorOptions
    } = options;

    // @see [https://github.com/nestjs/nest/issues/10683#issuecomment-1413690508](https://github.com/nestjs/nest/issues/10683#issuecomment-1413690508)
    this.validatorOptions = { forbidUnknownValues: false, ...validatorOptions };

    this.isTransformEnabled = !!transform;
    this.transformOptions = transformOptions;
    this.isDetailedOutputDisabled = disableErrorMessages;
    this.validateCustomDecorators = validateCustomDecorators || false;
    this.errorHttpStatusCode = HttpStatus.BAD_REQUEST;
    this.expectedType = expectedType;
  }

  protected readonly isTransformEnabled: boolean;
  protected isDetailedOutputDisabled?: boolean;
  protected validatorOptions: ValidatorOptions;
  protected transformOptions: ClassTransformOptions | undefined;
  protected errorHttpStatusCode: number;
  protected expectedType: Type | undefined;
  protected validateCustomDecorators: boolean;

  private readonly exceptionMapper: Record<
    Paramtype,
    ExceptionFactoryWithoutError
  > = {
    query: coreExceptions.invalidQueryParameters,
    param: coreExceptions.invalidPathParameters,
    body: coreExceptions.invalidBody,
    custom: coreExceptions.invalidRequest,
  };

  public async transform(value: unknown, metadata: ArgumentMetadata) {
    if (this.expectedType) {
      metadata = { ...metadata, metatype: this.expectedType };
    }

    const metatype = metadata.metatype;
    if (!metatype || !this.toValidate(metadata)) {
      return this.isTransformEnabled
        ? this.transformPrimitive(value, metadata)
        : value;
    }
    const originalValue = value;
    value = this.toEmptyIfNil(value, metatype);

    const isNil = value !== originalValue;
    const isPrimitive = this.isPrimitive(value);
    this.stripProtoKeys(value);
    let entity = plainToInstance<object, unknown>(
      metatype,
      value,
      this.transformOptions,
    );

    const originalEntity = entity;
    const isCtorNotEqual = entity.constructor !== metatype;

    if (isCtorNotEqual && !isPrimitive) {
      entity.constructor = metatype;
    } else if (isCtorNotEqual) {
      // when "entity" is a primitive value, we have to temporarily
      // replace the entity to perform the validation against the original
      // metatype defined inside the handler
      entity = { constructor: metatype };
    }

    const errors = await this.validate(entity, this.validatorOptions);
    if (errors.length > 0) {
      throw this.exceptionMapper[metadata.type](
        mapValidationErrorsToErrorDetails(errors),
      );
    }

    if (
      originalValue === undefined &&
      typeof originalEntity === 'string' &&
      originalEntity === ''
    ) {
      // Since SWC requires empty string for validation (to avoid an error),
      // a fallback is needed to revert to the original value (when undefined).
      // @see [https://github.com/nestjs/nest/issues/14430](https://github.com/nestjs/nest/issues/14430)
      return originalValue;
    }
    if (isPrimitive) {
      // if the value is a primitive value and the validation process has been successfully completed
      // we have to revert the original value passed through the pipe
      entity = originalEntity;
    }
    if (this.isTransformEnabled) {
      return entity;
    }
    if (isNil) {
      // if the value was originally undefined or null, revert it back
      return originalValue;
    }

    // we check if the number of keys of the "validatorOptions" is higher than 1 (instead of 0)
    // because the "forbidUnknownValues" now fallbacks to "false" (in case it wasn't explicitly specified)
    const shouldTransformToPlain =
      Object.keys(this.validatorOptions).length > 1;
    return shouldTransformToPlain
      ? instanceToPlain(entity, this.transformOptions)
      : value;
  }

  protected toValidate(metadata: ArgumentMetadata): boolean {
    const { metatype, type } = metadata;
    if (type === 'custom' && !this.validateCustomDecorators) {
      return false;
    }
    const types = [String, Boolean, Number, Array, Object, Buffer, Date];
    return !types.some((t) => metatype === t) && metatype != null;
  }

  protected transformPrimitive(
    value: unknown,
    metadata: ArgumentMetadata,
  ): unknown {
    if (!metadata.data) {
      // leave top-level query/param objects unmodified
      return value;
    }
    const { type, metatype } = metadata;
    if (type !== 'param' && type !== 'query') {
      return value;
    }
    if (metatype === Boolean) {
      if (value === undefined) {
        // This is an workaround to deal with optional boolean values since
        // optional booleans shouldn't be parsed to a valid boolean when
        // they were not defined
        return undefined;
      }
      // Any fasly value but `undefined` will be parsed to `false`
      return value === true || value === 'true';
    }
    if (metatype === Number) {
      if (value === undefined) {
        // This is a workaround to deal with optional numeric values since
        // optional numerics shouldn't be parsed to a valid number when
        // they were not defined
        return undefined;
      }
      return Number(value);
    }
    if (metatype === String && value !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      return String(value);
    }
    return value;
  }

  protected toEmptyIfNil<T = any, R = T>(
    value: T,
    metatype: Type<unknown> | object,
  ): R | object | string {
    if (value != null) {
      return value;
    }
    if (
      typeof metatype === 'function' ||
      (metatype && 'prototype' in metatype && metatype.prototype?.constructor)
    ) {
      return {};
    }
    // SWC requires empty string to be returned instead of an empty object
    // when the value is nil and the metatype is not a class instance, but a plain object (enum, for example).
    // Otherwise, the error will be thrown.
    // @see [https://github.com/nestjs/nest/issues/12680](https://github.com/nestjs/nest/issues/12680)
    return '';
  }

  protected stripProtoKeys(value: unknown) {
    if (value == null || typeof value !== 'object' || isTypedArray(value)) {
      return;
    }

    // Skip built-in JavaScript primitives to avoid Jest useFakeTimers conflicts
    if (BUILT_IN_TYPES.some((type) => value instanceof type)) {
      return;
    }

    if (Array.isArray(value)) {
      for (const v of value) {
        this.stripProtoKeys(v);
      }
      return;
    }

    // Delete dangerous prototype pollution keys
    Reflect.deleteProperty(value, '__proto__');
    Reflect.deleteProperty(value, 'prototype');

    // Only delete constructor if it's NOT a built-in type
    const constructorType = value?.constructor;
    if (constructorType && !BUILT_IN_TYPES_SET.has(constructorType)) {
      Reflect.deleteProperty(value, 'constructor');
    }

    for (const item of Object.values(value)) {
      this.stripProtoKeys(item);
    }
  }

  protected isPrimitive(value: unknown): boolean {
    return ['number', 'boolean', 'string'].includes(typeof value);
  }

  protected validate(
    object: object,
    validatorOptions?: ValidatorOptions,
  ): Promise<ValidationError[]> | ValidationError[] {
    return validate(object, validatorOptions);
  }
}
