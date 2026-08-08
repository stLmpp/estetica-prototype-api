import {
  type ErrorDetailModel,
  ErrorModel,
  ResponseErrorModel,
} from '../../shared/model/response-error.model';
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

const seenCodes = new Set<string>();

function buildExceptionResponse(
  args: SetOptional<ExceptionArgs, 'error' | 'details'>,
  errorOrDetails?: string | ErrorDetailModel[],
  details?: ErrorDetailModel[],
): ResponseErrorModel {
  const isDetails = Array.isArray(errorOrDetails);
  const error = String(
    isDetails ? args.error : (errorOrDetails ?? args.message),
  );
  const resolvedDetails = isDetails ? errorOrDetails : details;
  return new ResponseErrorModel(
    new ErrorModel(args.code, args.message, error, resolvedDetails),
    args.status,
  );
}

/**
 * For exceptions with a code known at compile time (declared once, e.g. `CoreExceptions`).
 * Registers the code in `seenCodes` to catch accidental duplicate definitions.
 */
export function exception(
  args: SetOptional<ExceptionArgs, 'error' | 'details'>,
): ExceptionFactory {
  if (seenCodes.has(args.code)) {
    throw new Error(`Exception with code ${args.code} already exists`);
  }
  seenCodes.add(args.code);
  return (errorOrDetails, details) =>
    buildExceptionResponse(args, errorOrDetails, details);
}

/**
 * For one-off exceptions built from a runtime/dynamic code (e.g. relaying a
 * third-party error). Skips the duplicate-code registry, which is only meant
 * for exceptions declared once in source.
 */
export function dynamicException(
  args: SetOptional<ExceptionArgs, 'error' | 'details'>,
): ResponseErrorModel {
  return buildExceptionResponse(args);
}
