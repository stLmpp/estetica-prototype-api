import { Injectable, Scope } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';
import { Redis } from '@upstash/redis';

@Injectable({ scope: Scope.TRANSIENT })
export class RedisHealthIndicator {
  constructor(
    private readonly redis: Redis,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  async pingCheck<Key extends string>(key: Key) {
    const check = this.healthIndicatorService.check(key);
    try {
      await this.redis.ping();
    } catch {
      return check.down('Unable to reach Redis');
    }
    return check.up();
  }
}
