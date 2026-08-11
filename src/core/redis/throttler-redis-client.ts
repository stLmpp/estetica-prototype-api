import { type Redis } from '@upstash/redis';

interface RedisScriptOptions {
  keys: string[];
  arguments: (string | number)[];
}

type ThrottlerScriptResult = [
  totalHits: number,
  timeToExpireMs: number,
  timeToBlockExpireMs: number,
  isBlocked: number,
];

/**
 * `RedisThrottlerStorage` (`@nestjs-redis/throttler-storage`) is built against
 * node-redis's `RedisClientType` — its `evalSha`/`eval` calls take a single
 * `{ keys, arguments }` options object, not the positional `(keys[], args[])`
 * signature `@upstash/redis` uses. Passing our upstash client straight through
 * makes `evalSha` receive that options object as its `keys` argument and throw
 * `keys is not iterable`. This adapts the upstash client to the shape
 * `RedisThrottlerStorage` expects, so the throttler can keep using the
 * REST-based client instead of adding a second, TCP-based Redis connection
 * just for rate limiting.
 */
export class ThrottlerRedisClient {
  constructor(private readonly redis: Redis) {}

  scriptLoad(script: string) {
    return this.redis.scriptLoad(script);
  }

  evalSha(sha1: string, options: RedisScriptOptions) {
    return this.redis.evalsha<unknown[], ThrottlerScriptResult>(
      sha1,
      options.keys,
      options.arguments,
    );
  }

  eval(script: string, options: RedisScriptOptions) {
    return this.redis.eval<unknown[], ThrottlerScriptResult>(
      script,
      options.keys,
      options.arguments,
    );
  }
}
