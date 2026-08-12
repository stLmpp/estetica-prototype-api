import { safe } from '../../shared/utils/safe';
import { type ZodType } from 'zod';

export type EnvPropertyOptions = {
  name: string;
  required?: boolean;
} & (
  | {
      type?: undefined;
      defaultValue?: string;
    }
  | {
      type: 'number';
      defaultValue?: number;
    }
  | {
      type: 'boolean';
      defaultValue?: boolean;
    }
  | {
      type: 'json';
      defaultValue?: unknown;
      typeGetter?: () => ZodType;
    }
  | {
      type: 'list';
      defaultValue?: Array<string | number | boolean>;
      separator?: string;
      listType?: 'string' | 'number' | 'boolean';
    }
);

export interface EnvPropertyMetadata {
  name: string;
  required: boolean;
  type: 'string' | 'number' | 'boolean' | 'json' | 'list';
  typeGetter?: () => ZodType;
  defaultValue?: unknown;
  separator?: string;
  listType?: 'string' | 'number' | 'boolean';
}

const DEFAULT_VALUES: EnvPropertyMetadata = {
  name: '',
  required: false,
  type: 'string',
};

const typeParser: Record<
  EnvPropertyMetadata['type'],
  (value: string, metadata: EnvPropertyMetadata) => any
> = {
  number: (value, { name }) => {
    const number = Number(value);
    if (Number.isNaN(number)) {
      throw new Error(`Invalid number value for ${name}: ${value}`);
    }
    return number;
  },
  string: (value) => value,
  boolean: (value) => value === 'true',
  json: (value, { name, typeGetter }) => {
    const [error, json] = safe(() => JSON.parse(value));
    if (error) {
      throw new Error(`Invalid JSON value for ${name}: ${value}`);
    }
    if (typeGetter) {
      const schema = typeGetter();
      const parsedJson = schema.safeParse(json);
      if (!parsedJson.success) {
        throw new Error(`Invalid JSON schema for ${name}: ${parsedJson.error}`);
      }
      return parsedJson.data;
    }

    return json;
  },
  list: (value, config) => {
    const { separator = ',', listType = 'string' } = config;
    const parser = typeParser[listType];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return value.split(separator).map((item) =>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      parser(item.trim(), {
        ...config,
        type: listType,
      }),
    );
  },
};

const cache = new Map<string, any>();

function getCacheKey(
  propertyKey: string | symbol,
  config: EnvPropertyMetadata,
) {
  return `${String(propertyKey)}-${config.name}-${config.type}-${String(config.defaultValue)}`;
}

export function clearEnvCache() {
  cache.clear();
}

function isEnvValueDefined(value: string | undefined): value is string {
  return value !== undefined && value.trim() !== '';
}

export const ENV_PREFIX = '';

function parseValue(metadata: EnvPropertyMetadata): any {
  const { name, defaultValue, required, type } = metadata;
  const value = process.env[ENV_PREFIX + name];
  const isValueDefined = isEnvValueDefined(value);
  if (!isValueDefined && required && defaultValue === undefined) {
    throw new Error(`Missing required config property ${name}`);
  }
  if (!isValueDefined) {
    return defaultValue;
  }
  return typeParser[type](value.trim(), metadata);
}

export function EnvProperty(options: EnvPropertyOptions): PropertyDecorator {
  return (target, propertyKey) => {
    Object.defineProperty(target, propertyKey, {
      enumerable: true,
      configurable: false,
      get: function (): any {
        const config: EnvPropertyMetadata = {
          ...DEFAULT_VALUES,
          ...options,
        };
        const cacheKey = getCacheKey(propertyKey, config);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const cachedValue = cache.get(cacheKey);
        if (cachedValue !== undefined) {
          return cachedValue;
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const value = parseValue(config);
        cache.set(cacheKey, value);
        return value;
      },
      set: function () {
        throw new Error(
          `Cannot set value for ConfigProperty. key = ${String(propertyKey)}`,
        );
      },
    });
  };
}
