import { Controller, Get } from '@nestjs/common';
import { HealthResponse, HealthStatus } from './health.response';
import { ApiTags } from '@nestjs/swagger';
import { OptionalAuth } from '@thallesp/nestjs-better-auth';
import { ZodResponse } from 'nestjs-zod';

@Controller({
  path: 'health',
  version: '1',
})
@ApiTags('Health')
@OptionalAuth()
export class HealthController {
  @ZodResponse({ type: HealthResponse })
  @Get()
  health(): HealthResponse {
    return {
      status: HealthStatus.OK,
    };
  }
}
