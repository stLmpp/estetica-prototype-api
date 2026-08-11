import { Module } from '@nestjs/common';
import { Redis } from '@upstash/redis';
import { redis } from './redis';
import { EnvironmentModule } from '../config/environment.module';

@Module({
  imports: [EnvironmentModule],
  providers: [
    {
      provide: Redis,
      useValue: redis,
    },
  ],
  exports: [Redis],
})
export class RedisModule {}
