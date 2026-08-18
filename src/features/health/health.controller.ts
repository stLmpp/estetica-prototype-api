import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { HealthResponse, HealthStatus } from './health.response';
import { ApiTags } from '@nestjs/swagger';
import { OptionalAuth } from '@thallesp/nestjs-better-auth';
import { ZodResponse } from 'nestjs-zod';
import { MainDatabaseHealthIndicator } from './main-database.health-indicator';
import { RedisHealthIndicator } from './redis.health-indicator';

@Controller({
  path: 'health',
  version: '1',
})
@ApiTags('Health')
@OptionalAuth()
export class HealthController {
  constructor(
    private readonly healthCheckService: HealthCheckService,
    private readonly mainDatabaseHealthIndicator: MainDatabaseHealthIndicator,
    private readonly redisHealthIndicator: RedisHealthIndicator,
  ) {}

  @ZodResponse({ type: HealthResponse })
  @Get('live')
  live(): HealthResponse {
    return {
      status: HealthStatus.OK,
    };
  }

  @HealthCheck()
  @Get('ready')
  ready() {
    return this.healthCheckService.check([
      () => this.mainDatabaseHealthIndicator.pingCheck('mainDatabase'),
      () => this.redisHealthIndicator.pingCheck('redis'),
    ]);
  }
}
