import { Module } from '@nestjs/common';
import { Redis } from '@upstash/redis';
import { redis } from './redis';

@Module({
  providers: [
    {
      provide: Redis,
      useValue: redis,
    },
  ],
  exports: [Redis],
})
export class RedisModule {}
