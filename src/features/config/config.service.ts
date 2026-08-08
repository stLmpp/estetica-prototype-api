import { Injectable } from '@nestjs/common';
import { type PublishConfigDto } from './dto/input/publish-config.request';
import {
  ConfigRepository,
  PossibleConfigParams,
} from '../../database/main/repositories/config.repository';
import { ConfigAdminRepository } from '../../database/main/repositories/config-admin.repository';
import { CONFIG_GROUP_GLOBAL } from './config.constants';
import { MainTransactional } from '../../database/main/main-database-connection';
import { Redis } from '@upstash/redis';
import { InferSelectModel } from 'drizzle-orm';
import { mainEntities } from '../../database/main/main-entities';
import { FilterConfigDto } from './dto/input/list-config.request';
import {
  AuthOrgSecurityLevel,
  AuthSecurityLevel,
  GLOBAL_TENANT,
  GLOBAL_USER,
} from '../../auth/constants';
import { GetConfigRequest } from './dto/input/get-config.request';
import { AuthValidationService } from '../../auth/auth-validation.service';
import { ConfigExceptions } from './config-exceptions';
import { ConfigModel } from './model/config.model';
import { GetGroupRequest } from './dto/input/get-group.request';
import { ConfigType } from '../../shared/domain/config-type.enum';
import { BooleanParamSchema } from '../../shared/model/common.model';
import { safe } from '../../shared/utils/safe';
import { AppEnv } from '../../core/config/app-env';
import { SecurityLevelType } from '../../shared/domain/security-level-type.enum';

@Injectable()
export class ConfigService {
  constructor(
    private readonly configRepository: ConfigRepository,
    private readonly configAdminRepository: ConfigAdminRepository,
    private readonly redis: Redis,
    private readonly authValidationService: AuthValidationService,
    private readonly appEnv: AppEnv,
  ) {}

  private readonly roleToSecurityLevelType = {
    [SecurityLevelType.GENERAL]: AuthSecurityLevel,
    [SecurityLevelType.ORG]: AuthOrgSecurityLevel,
  };

  private createKey(
    group: string,
    name: string,
    userId: string,
    tenantId: string,
  ) {
    return `tenant:${tenantId}:user:${userId}:group:${group}:config:${name}`;
  }

  @MainTransactional()
  async publish(
    config: PublishConfigDto,
  ): Promise<[config: ConfigModel, old?: ConfigModel]> {
    const userId = config.userId ?? GLOBAL_USER;
    const tenantId = config.tenantId ?? GLOBAL_TENANT;
    this.assertValueIsParseable(config.type, config.value);
    await Promise.all([
      this.authValidationService.assertTenantExists(tenantId),
      this.authValidationService.assertUserExists(userId),
    ]);
    this.authValidationService.assertSessionHasAccess(tenantId, userId);
    const group = config.group ?? CONFIG_GROUP_GLOBAL;
    const entity =
      await this.configAdminRepository.findFirstLatestVersionByGroupAndNameAndUserIdAndTenantId(
        group,
        config.name,
        userId,
        tenantId,
      );
    const version = (entity?.version ?? 0) + 1;
    const newEntityInsert: Parameters<ConfigAdminRepository['insert']>[0] = {
      displayName: config.displayName,
      name: config.name,
      tenantId,
      userId,
      version,
      description: config.description,
      value: config.value,
      type: config.type,
      group,
      securityLevelType: config.roleType,
    };
    switch (config.roleType) {
      case SecurityLevelType.GENERAL: {
        newEntityInsert.requiredSecurityLevel = AuthSecurityLevel[config.role];
        break;
      }
      case SecurityLevelType.ORG: {
        newEntityInsert.requiredSecurityLevel =
          AuthOrgSecurityLevel[config.role];
        break;
      }
      default: {
        // Do nothing
        break;
      }
    }
    const [newEntity] = await Promise.all([
      this.configAdminRepository
        .insert(newEntityInsert)
        .then((results) => results.at(0)!),
      entity && this.configAdminRepository.inactivate(entity.id),
      entity &&
        this.redis.del(
          this.createKey(
            entity.group,
            entity.name,
            entity.userId,
            entity.tenantId,
          ),
        ),
    ]);
    return [
      this.mapEntityToDto(newEntity),
      entity && this.mapEntityToDto(entity),
    ];
  }

  async listPaginated(dto: FilterConfigDto) {
    const { configs, count } = await this.configRepository.findPaginated(dto);
    return {
      configs: configs.map((config) => this.mapEntityToDto(config)),
      count,
    };
  }

  async get(dto: GetConfigRequest) {
    this.authValidationService.assertSessionHasAccess(dto.tenantId, dto.userId);

    const key = this.createKey(dto.group, dto.name, dto.userId, dto.tenantId);

    const configCache = await this.redis.get<ConfigModel>(key);

    if (
      configCache &&
      (dto.version === 'latest' || configCache.version === dto.version)
    ) {
      return configCache;
    }

    const combinations: PossibleConfigParams[] = [
      {
        order: 1,
        userId: dto.userId,
        tenantId: dto.tenantId,
        group: dto.group,
      },
      {
        order: 2,
        userId: GLOBAL_USER,
        tenantId: dto.tenantId,
        group: dto.group,
      },
      {
        order: 3,
        userId: dto.userId,
        tenantId: GLOBAL_TENANT,
        group: dto.group,
      },
      {
        order: 4,
        userId: dto.userId,
        tenantId: dto.tenantId,
        group: CONFIG_GROUP_GLOBAL,
      },
      {
        order: 5,
        userId: GLOBAL_USER,
        tenantId: GLOBAL_TENANT,
        group: dto.group,
      },
      {
        order: 6,
        userId: GLOBAL_USER,
        tenantId: dto.tenantId,
        group: CONFIG_GROUP_GLOBAL,
      },
      {
        order: 7,
        userId: dto.userId,
        tenantId: GLOBAL_TENANT,
        group: CONFIG_GROUP_GLOBAL,
      },
      {
        order: 8,
        userId: GLOBAL_USER,
        tenantId: GLOBAL_TENANT,
        group: CONFIG_GROUP_GLOBAL,
      },
    ];

    const applicableCombinations = combinations.filter((combo) => {
      const isUserIdMatch =
        dto.userId === combo.userId || combo.userId === GLOBAL_USER;
      const isTenantIdMatch =
        dto.tenantId === combo.tenantId || combo.tenantId === GLOBAL_TENANT;
      const isGroupMatch =
        dto.group === combo.group || combo.group === CONFIG_GROUP_GLOBAL;

      return isUserIdMatch && isTenantIdMatch && isGroupMatch;
    });

    const config = await this.configRepository.findFirstByParams({
      name: dto.name,
      version: dto.version,
      params: applicableCombinations,
    });

    if (!config) {
      throw ConfigExceptions.configNotFound();
    }

    const response = this.mapEntityToDto(config, dto.parseValue);

    void this.redis.set(key, response, {
      ex: this.appEnv.configCacheExpireSeconds,
    });

    return response;
  }

  async listGroup(dto: GetGroupRequest) {
    this.authValidationService.assertSessionHasAccess(dto.tenantId, dto.userId);
    const configs = await this.configRepository.findByGroup(dto);
    return configs.map((config) => this.mapEntityToDto(config, dto.parseValue));
  }

  private mapEntityToDto(
    entity: InferSelectModel<typeof mainEntities.config>,
    parseValue = false,
  ): ConfigModel {
    return {
      displayName: entity.displayName,
      id: entity.id,
      name: entity.name,
      description: entity.description ?? undefined,
      inactivatedAt: entity.inactivatedAt ?? undefined,
      version: entity.version,
      userId: entity.userId,
      tenantId: entity.tenantId,
      value: entity.value,
      valueParsed: parseValue
        ? this.safeParseValue(entity.type, entity.value)
        : undefined,
      type: entity.type,
      group: entity.group,
    };
  }

  private readonly mapParse: Record<
    ConfigType,
    {
      parse: (value: string) => unknown;
      fallback: unknown;
    }
  > = {
    [ConfigType.STRING]: {
      parse: (value) => value,
      fallback: '',
    },
    [ConfigType.NUMBER]: {
      parse: (value) => {
        const number = Number(value);
        if (isNaN(number)) {
          throw new Error(
            `Failed to parse ${ConfigType.NUMBER} with value ${value}`,
          );
        }
        return number;
      },
      fallback: 0,
    },
    [ConfigType.BOOLEAN]: {
      parse: (value) => {
        const result = BooleanParamSchema.safeParse(value);
        if (!result.success) {
          throw new Error(
            `Failed to parse ${ConfigType.BOOLEAN} with value ${value}`,
          );
        }
        return result.data;
      },
      fallback: false,
    },
    [ConfigType.JSON]: {
      parse: (value) => {
        const [error, json] = safe(() => JSON.parse(value));
        if (error) {
          throw new Error(
            `Failed to parse ${ConfigType.JSON} with value ${value}`,
          );
        }
        return json;
      },
      fallback: null,
    },
  };

  private safeParseValue(type: ConfigType, value: string): unknown {
    const [error, parsed] = safe(() => this.mapParse[type].parse(value.trim()));
    if (error) {
      return this.mapParse[type].fallback;
    }
    return parsed;
  }

  private assertValueIsParseable(type: ConfigType, value: string) {
    const [error] = safe(() => this.mapParse[type].parse(value.trim()));
    if (error) {
      throw ConfigExceptions.valueNotParseable(
        `Value ${value} not parseable to ${type}`,
        [
          {
            field: 'value',
            issue: error.message,
          },
        ],
      );
    }
  }
}
