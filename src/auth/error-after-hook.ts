import { Injectable } from '@nestjs/common';
import {
  AfterHook,
  type AuthHookContext,
  Hook,
} from '@thallesp/nestjs-better-auth';
import { isAPIError } from 'better-auth/api';
import { exception } from '../shared/exception/exception';

@Injectable()
@Hook()
export class ErrorAfterHook {
  @AfterHook()
  afterHook(ctx: AuthHookContext) {
    const error = ctx.context.returned;
    if (!isAPIError(error)) {
      return;
    }
    const authException = exception({
      code: error.body?.code ?? 'UNKNOWN_AUTH_ERROR',
      message: error.body?.message ?? error.message,
      status: error.statusCode,
      error: error.message,
    });
    throw ctx.error(error.status, authException(), error.headers);
  }
}
