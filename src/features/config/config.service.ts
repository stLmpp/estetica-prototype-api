import { Injectable } from '@nestjs/common';
import { PublishConfigDto } from './dto/input/publish-config.request';
import { ConfigRepository } from '../../database/main/repositories/config.repository';
import { CONFIG_GLOBAL_PLACEHOLDER } from './config.constants';
import { MainTransactional } from '../../database/main/main-database-connection';
import { Redis } from '@upstash/redis';
import { PublishConfigResDto } from './dto/output/publish-config.response';
import { InferSelectModel } from 'drizzle-orm';
import { mainEntities } from '../../database/main/main-entities';

@Injectable()
export class ConfigService {
  constructor(
    private readonly configRepository: ConfigRepository,
    private readonly redis: Redis,
  ) {}

  private createKey(name: string, userId: string, tenantId: string) {
    return `tenant:${tenantId}:user:${userId}:config:${name}`;
  }

  @MainTransactional()
  async publish(
    config: PublishConfigDto,
  ): Promise<[config: PublishConfigResDto, old?: PublishConfigResDto]> {
    const userId = config.userId ?? CONFIG_GLOBAL_PLACEHOLDER;
    const tenantId = config.tenantId ?? CONFIG_GLOBAL_PLACEHOLDER;
    const entity =
      await this.configRepository.getLatestVersionByNameAndUserIdAndTenantId(
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
        })
        .then((results) => results.at(0)!),
      entity && this.configRepository.inactivate(entity.id),
      entity &&
        this.redis.del(
          this.createKey(entity.name, entity.userId, entity.tenantId),
        ),
    ]);
    return [
      this.mapEntityToDto(newEntity),
      entity ? this.mapEntityToDto(entity) : undefined,
    ];
  }

  private mapEntityToDto(
    entity: InferSelectModel<typeof mainEntities.config>,
  ): PublishConfigResDto {
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
    };
  }
}
