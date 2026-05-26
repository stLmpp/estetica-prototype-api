import { safe } from '../utils/safe';
import { type ZodType } from 'zod';

interface ConfigPropertyOptionsBase {
  name: string;
  required?: boolean;
}

export type ConfigPropertyOptions = ConfigPropertyOptionsBase &
  (
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

export interface ConfigPropertyMetadata {
  name: string;
  required: boolean;
  type: 'string' | 'number' | 'boolean' | 'json' | 'list';
  typeGetter?: () => ZodType;
  defaultValue?: unknown;
  separator?: string;
  listType?: 'string' | 'number' | 'boolean';
}

const DEFAULT_VALUES: ConfigPropertyMetadata = {
  name: '',
  required: false,
  type: 'string',
};

const typeParser: Record<
  ConfigPropertyMetadata['type'],
  (value: string, metadata: ConfigPropertyMetadata) => any
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
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
  config: ConfigPropertyMetadata,
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

function parseValue(config: ConfigPropertyMetadata): any {
  const { name, defaultValue, required, type } = config;
  const value = process.env[ENV_PREFIX + name];
  const isValueDefined = isEnvValueDefined(value);
  if (!isValueDefined && required && defaultValue === undefined) {
    throw new Error(`Missing required config property ${name}`);
  }
  if (!isValueDefined) {
    return defaultValue;
  }
  return typeParser[type](value.trim(), config);
}

export function ConfigProperty(
  options: ConfigPropertyOptions,
): PropertyDecorator {
  return (target, propertyKey) => {
    Object.defineProperty(target, propertyKey, {
      enumerable: true,
      configurable: false,
      get: function (): any {
        const config: ConfigPropertyMetadata = {
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
