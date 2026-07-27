import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { Roles } from '@thallesp/nestjs-better-auth';
import { AuthRole } from '../../auth/auth';
import { PublishConfigRequest } from './dto/input/publish-config.request';
import { PublishConfigResponseModel } from './dto/output/publish-config.response';
import { ConfigService } from './config.service';
import { ResponseType } from '../../shared/decorator/response-type.decorator';
import { FilterConfigDto } from './dto/input/list-config.request';
import { ListConfigResponseModel } from './dto/output/list-config.response';

@Controller({
  path: 'config',
  version: '1',
})
@Roles([AuthRole.Admin])
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @ResponseType(PublishConfigResponseModel)
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

  @ResponseType(ListConfigResponseModel)
  @Get()
  async listPaginated(
    @Query() query: FilterConfigDto,
  ): Promise<ListConfigResponseModel> {
    const { configs, count } = await this.configService.listPaginated(query);
    return {
      data: {
        items: configs,
      },
      meta: {
        total: count,
        limit: query.limit,
        page: query.page,
      },
    };
  }
}
