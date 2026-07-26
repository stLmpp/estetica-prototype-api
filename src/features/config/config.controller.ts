import { Body, Controller, Post } from '@nestjs/common';
import { Roles } from '@thallesp/nestjs-better-auth';
import { AuthRole } from '../../auth/auth';
import { PublishConfigRequest } from './dto/input/publish-config.request';
import { PublishConfigResponseModel } from './dto/output/publish-config.response';
import { ConfigService } from './config.service';

@Controller({
  path: 'config',
  version: '1',
})
@Roles([AuthRole.Admin])
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Post('publish')
  async publish(
    @Body() request: PublishConfigRequest,
  ): Promise<PublishConfigResponseModel> {
    const [config, old] = await this.configService.publish(request.config);

    return {
      data: {
        config,
        oldConfig: old,
      },
    };
  }
}
