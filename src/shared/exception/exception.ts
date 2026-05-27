import {
  type ErrorDetailModel,
  ErrorModel,
  ResponseErrorModel,
} from '../model/response-error.model';
import { type SetOptional } from 'type-fest';

export interface ExceptionFactory {
  (error?: string, details?: ErrorDetailModel[]): ResponseErrorModel;
  (details?: ErrorDetailModel[], _?: ErrorDetailModel[]): ResponseErrorModel;
  (
    errorOrDetails?: string | ErrorDetailModel[],
    details?: ErrorDetailModel[],
  ): ResponseErrorModel;
}

type ExceptionArgs = ErrorModel & { status: number };

export function exception(
  args: SetOptional<ExceptionArgs, 'error' | 'details'>,
): ExceptionFactory {
  return (errorOrDetails, details) => {
    const isDetails = Array.isArray(errorOrDetails);
    const error = String(
      isDetails ? args.error : (errorOrDetails ?? args.message),
    );
    const resolvedDetails = isDetails ? errorOrDetails : details;
    return new ResponseErrorModel(
      new ErrorModel(args.code, args.message, error, resolvedDetails),
      args.status,
    );
  };
}
