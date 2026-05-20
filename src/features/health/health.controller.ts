import { Controller, Get } from '@nestjs/common';
import { HealthResponse, HealthStatus } from './health.response';
import { ApiTags } from '@nestjs/swagger';

@Controller({
  path: 'health',
  version: '1',
})
@ApiTags('Health')
export class HealthController {
  @Get()
  health(): HealthResponse {
    return {
      status: HealthStatus.OK,
    };
  }
}
