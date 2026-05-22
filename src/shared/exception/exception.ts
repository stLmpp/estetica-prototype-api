import {
  type ErrorDetailModel,
  ErrorModel,
  ResponseErrorModel,
} from '../model/response.model';
import { type SetOptional } from 'type-fest';

export interface ExceptionFactoryWithoutError {
  (details?: ErrorDetailModel[]): ResponseErrorModel;
}

export interface ExceptionFactoryWithError {
  (error: string, details?: ErrorDetailModel[]): ResponseErrorModel;
}

export type ExceptionFactory =
  | ExceptionFactoryWithoutError
  | ExceptionFactoryWithError;

type ExceptionArgs = ErrorModel & { status: number };

export function exception(args: ExceptionArgs): ExceptionFactoryWithoutError;
export function exception(
  args: SetOptional<ExceptionArgs, 'message' | 'details'>,
): ExceptionFactoryWithError;
export function exception(
  args: SetOptional<ExceptionArgs, 'message' | 'details'>,
): ExceptionFactory {
  return (error, details) =>
    new ResponseErrorModel(
      new ErrorModel(args.code, error, details),
      args.status,
    );
}
