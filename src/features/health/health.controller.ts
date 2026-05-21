import { Controller, Get } from '@nestjs/common';
import { HealthResponse, HealthStatus } from './health.response';
import { ApiTags } from '@nestjs/swagger';
import { OptionalAuth } from '@thallesp/nestjs-better-auth';

@Controller({
  path: 'health',
  version: '1',
})
@ApiTags('Health')
@OptionalAuth()
export class HealthController {
  @Get()
  health(): HealthResponse {
    return {
      status: HealthStatus.OK,
    };
  }
}
