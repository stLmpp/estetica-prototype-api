import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { MainDatabaseModule } from '../../database/main/main-database.module';
import { RedisModule } from '../../core/redis/redis.module';
import { HealthController } from './health.controller';
import { MainDatabaseHealthIndicator } from './main-database.health-indicator';
import { RedisHealthIndicator } from './redis.health-indicator';

@Module({
  imports: [TerminusModule.forRoot(), MainDatabaseModule, RedisModule],
  controllers: [HealthController],
  providers: [MainDatabaseHealthIndicator, RedisHealthIndicator],
})
export class HealthModule {}
