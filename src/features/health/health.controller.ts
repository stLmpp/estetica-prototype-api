import { Controller, Get } from '@nestjs/common';
import { HealthResponse, HealthStatus } from './health.response';
import { ApiTags } from '@nestjs/swagger';
import { OptionalAuth } from '@thallesp/nestjs-better-auth';
import { ResponseType } from '../../shared/decorator/response-type.decorator';

@Controller({
  path: 'health',
  version: '1',
})
@ApiTags('Health')
@OptionalAuth()
export class HealthController {
  @ResponseType(HealthResponse)
  @Get()
  health(): HealthResponse {
    return {
      status: HealthStatus.OK,
    };
  }
}
