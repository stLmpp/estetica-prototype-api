import { ArgumentsHost, Catch } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { ResponseErrorModel } from '../../shared/model/response.model';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const applicationRef =
      this.applicationRef ||
      (this.httpAdapterHost && this.httpAdapterHost.httpAdapter)!;

    // TODO add handling for zod exceptions

    if (exception instanceof ResponseErrorModel) {
      const response: unknown = host.getArgByIndex(1);
      if (!applicationRef.isHeadersSent(response)) {
        applicationRef.reply(response, exception, exception.statusCode);
      } else {
        applicationRef.end(response);
      }
      return;
    }

    super.catch(exception, host);
  }
}
