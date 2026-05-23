import { type ValidationError } from '@nestjs/common';
import { type ErrorDetailModel } from '../model/response.model';

export function mapValidationErrorsToErrorDetails(
  errors: ValidationError[],
  parentPath = '',
): ErrorDetailModel[] {
  const result: ErrorDetailModel[] = [];

  for (const error of errors) {
    const path = parentPath
      ? `${parentPath}.${error.property}`
      : error.property;

    if (error.constraints) {
      for (const issue of Object.values(error.constraints)) {
        result.push({ issue, field: path });
      }
    }

    if (error.children?.length) {
      result.push(...mapValidationErrorsToErrorDetails(error.children, path));
    }
  }

  return result;
}
