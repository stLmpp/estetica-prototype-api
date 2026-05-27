import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  StreamableFile,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, switchMap } from 'rxjs';
import { isZodDto } from 'nestjs-zod/dto';
import { ZodDto, ZodSerializationException } from 'nestjs-zod';

@Injectable()
export class CustomZodSerializerInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const responseSchema = this.getContextResponseSchema(context);

    return next.handle().pipe(
      switchMap(async (res: unknown) => {
        if (!responseSchema || res instanceof StreamableFile) {
          return res;
        }

        if (Array.isArray(responseSchema)) {
          const [dto] = responseSchema;
          const schema = dto.schema;

          const arrSchema = schema.array();

          try {
            return arrSchema.decode(res as never);
          } catch (error) {
            throw new ZodSerializationException(error);
          }
        }

        if (isZodDto(responseSchema)) {
          try {
            return responseSchema.schema.decode(res);
          } catch (error) {
            throw new ZodSerializationException(error);
          }
        }

        return res;
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
