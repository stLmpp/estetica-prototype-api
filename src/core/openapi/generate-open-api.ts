import { generateSchema, type OpenAPIObject } from '@nestjs/swagger';
import {
  ErrorDetailModel,
  ErrorModel,
  ResponseErrorModel,
} from '../../shared/model/response.model';
import { type Class } from 'type-fest';

const errorSchemas: Class<any>[] = [
  ResponseErrorModel,
  ErrorModel,
  ErrorDetailModel,
];

const methods = ['get', 'post', 'put', 'patch', 'delete'] as const;
const methodsSet = new Set(methods);
const errorStatus = [
  { status: 400, description: 'Bad Request' },
  { status: 401, description: 'Unauthorized' },
  { status: 403, description: 'Forbidden' },
  { status: 404, description: 'Not Found' },
  { status: 409, description: 'Conflict' },
  { status: 422, description: 'Unprocessable Entity' },
  { status: 429, description: 'Too Many Requests' },
  { status: 500, description: 'Internal Server Error' },
];

function isMethod(method: unknown): method is (typeof methods)[number] {
  return methodsSet.has(method as (typeof methods)[number]);
}

export function generateOpenApi(
  document: OpenAPIObject,
  authOpenApi: Partial<OpenAPIObject>,
) {
  document.components ??= {};
  document.components.schemas ??= {};

  for (const model of errorSchemas) {
    const { schema } = generateSchema(model);
    document.components.schemas[model.name] = schema;
  }

  document.paths ??= {};

  for (const pathValue of Object.values(document.paths)) {
    const keys = Object.keys(pathValue) as Array<keyof typeof pathValue>;
    for (const method of keys) {
      if (!isMethod(method)) {
        continue;
      }
      const methodValue = pathValue[method] ?? { responses: {} };
      methodValue.responses ??= {};
      for (const { status, description } of errorStatus) {
        methodValue.responses[status] ??= {
          description,
          content: {
            'application/json': {
              schema: {
                $ref: `#/components/schemas/${ResponseErrorModel.name}`,
              },
            },
          },
        };
      }
    }
  }

  Object.assign(document.paths, authOpenApi.paths);
  const keys = [
    ...new Set([
      ...Object.keys(document.components),
      ...Object.keys(authOpenApi.components ?? {}),
    ] as Array<keyof NonNullable<OpenAPIObject['components']>>),
  ];
  for (const key of keys) {
    document.components[key] ??= {};
    Object.assign(document.components[key], authOpenApi.components?.[key]);
  }

  return document;
}
