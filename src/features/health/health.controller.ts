import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { HealthResponse, HealthStatus } from './health.response';
import { ApiTags } from '@nestjs/swagger';
import { OptionalAuth } from '@thallesp/nestjs-better-auth';
import { MainDatabaseHealthIndicator } from './main-database.health-indicator';
import { RedisHealthIndicator } from './redis.health-indicator';
import { ResponseType } from '../../shared/decorator/response-type.decorator';

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

  @ResponseType(HealthResponse)
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
