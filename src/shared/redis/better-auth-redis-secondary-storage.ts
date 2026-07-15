import { type SecondaryStorage } from 'better-auth';
import { type Redis } from '@upstash/redis';
import { redis } from './redis';
import { LoggerService } from '../logger/logger.service';

export class BetterAuthRedisSecondaryStorage implements SecondaryStorage {
  private constructor(private readonly redis: Redis) {
    this.logger = LoggerService.create(BetterAuthRedisSecondaryStorage.name);
  }

  private readonly logger: LoggerService;
  private readonly incrementScript = `
local value = redis.call("INCR", KEYS[1])
if value == 1 then
  redis.call("EXPIRE", KEYS[1], ARGV[1])
end
return value
`;

  private key(key: string) {
    return `better-auth:${key}`;
  }

  async delete(key: string) {
    this.logger.debug(`Deleting key ${key}`);
    await this.redis.del(this.key(key));
  }

  async get(key: string) {
    this.logger.debug(`Getting key ${key}`);
    return this.redis.get(this.key(key));
  }

  async getAndDelete(key: string) {
    this.logger.debug(`Getting and deleting key ${key}`);
    return this.redis.getdel(this.key(key));
  }

  async increment(key: string, ttl: number) {
    this.logger.debug(`Incrementing key ${key} - ttl: ${ttl}`, { key, ttl });
    const value = await this.redis.eval(
      this.incrementScript,
      [this.key(key)],
      [ttl],
    );
    return Number(value);
  }

  async set(key: string, value: string, ttl: number | undefined) {
    this.logger.debug(`Setting key ${key} - ttl: ${ttl}`, { key, ttl, value });
    await this.redis.set(this.key(key), value, ttl ? { ex: ttl } : undefined);
  }

  private static readonly instance = new BetterAuthRedisSecondaryStorage(redis);

  static getInstance() {
    return this.instance;
  }
}
