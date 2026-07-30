import { Injectable } from '@nestjs/common';
import { PublishConfigDto } from './dto/input/publish-config.request';
import {
  ConfigRepository,
  PossibleConfigParams,
} from '../../database/main/repositories/config.repository';
import { CONFIG_GROUP_GLOBAL } from './config.constants';
import { MainTransactional } from '../../database/main/main-database-connection';
import { Redis } from '@upstash/redis';
import { InferSelectModel } from 'drizzle-orm';
import { mainEntities } from '../../database/main/main-entities';
import { FilterConfigDto } from './dto/input/list-config.request';
import { GLOBAL_TENANT, GLOBAL_USER } from '../../auth/constants';
import { GetConfigRequest } from './dto/input/get-config.request';
import { AuthValidationService } from '../../auth/auth-validation.service';
import { ConfigExceptions } from './config-exceptions';
import { ConfigModel } from './model/config.model';
import { GetGroupRequest } from './dto/input/get-group.request';

@Injectable()
export class ConfigService {
  constructor(
    private readonly configRepository: ConfigRepository,
    private readonly redis: Redis,
    private readonly authValidationService: AuthValidationService,
  ) {}

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
    await Promise.all([
      this.authValidationService.assertTenantExists(tenantId),
      this.authValidationService.assertUserExists(userId),
    ]);
    this.authValidationService.assertSessionHasAccess(tenantId, userId);
    const group = config.group ?? CONFIG_GROUP_GLOBAL;
    const entity =
      await this.configRepository.findFirstLatestVersionByGroupAndNameAndUserIdAndTenantId(
        group,
        config.name,
        userId,
        tenantId,
      );
    const version = (entity?.version ?? 0) + 1;
    const [newEntity] = await Promise.all([
      this.configRepository
        .insert({
          displayName: config.displayName,
          name: config.name,
          tenantId,
          userId,
          version,
          description: config.description,
          value: config.value,
          type: config.type,
          group,
        })
        .then((results) => results.at(0)!),
      entity && this.configRepository.inactivate(entity.id),
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
      configs: configs.map(this.mapEntityToDto),
      count,
    };
  }

  async get(dto: GetConfigRequest) {
    this.authValidationService.assertSessionHasAccess(dto.tenantId, dto.userId);
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
    return this.mapEntityToDto(config);
  }

  async listGroup(dto: GetGroupRequest) {
    this.authValidationService.assertSessionHasAccess(dto.tenantId, dto.userId);
    const configs = await this.configRepository.findByGroup(dto);
    return configs.map(this.mapEntityToDto);
  }

  private mapEntityToDto(
    this: void,
    entity: InferSelectModel<typeof mainEntities.config>,
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
      type: entity.type,
      group: entity.group,
    };
  }
}
