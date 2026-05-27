import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  StreamableFile,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, switchMap } from 'rxjs';
import { ZodDto, ZodSerializationException } from 'nestjs-zod';

@Injectable()
export class CustomZodSerializerInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const responseSchema = this.getContextResponseSchema(context);

    if (!responseSchema) {
      return next.handle();
    }

    const schema = Array.isArray(responseSchema)
      ? responseSchema[0].schema.array()
      : responseSchema.schema;

    return next.handle().pipe(
      switchMap(async (res: unknown) => {
        if (res instanceof StreamableFile) {
          return res;
        }

        const result = await schema.safeParseAsync(res);

        if (result.success) {
          return result.data;
        }

        throw new ZodSerializationException(result.error);
      }),
    );
  }

  protected getContextResponseSchema(
    context: ExecutionContext,
  ): ZodDto | [ZodDto] | undefined {
    return this.reflector.getAllAndOverride('ZOD_SERIALIZER_DTO_OPTIONS', [
      context.getHandler(),
      context.getClass(),
    ]);
  }
}
