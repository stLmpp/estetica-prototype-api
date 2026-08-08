import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { UserHasPermission } from '@thallesp/nestjs-better-auth';
import {
  type PublishConfigRequest,
  PublishConfigRequestSchema,
} from './dto/input/publish-config.request';
import { PublishConfigResponseModel } from './dto/output/publish-config.response';
import { ConfigService } from './config.service';
import { ResponseType } from '../../shared/decorator/response-type.decorator';
import { FilterConfigDto } from './dto/input/list-config.request';
import {
  ListConfigPaginatedResponseModel,
  ListConfigResponseModel,
} from './dto/output/list-config.response';
import { GetConfigResponse } from './dto/output/get-config.response';
import { GetConfigRequest } from './dto/input/get-config.request';
import { GetGroupRequest } from './dto/input/get-group.request';
import { ZodValidationPipe } from 'nestjs-zod';
import { BodyType } from '../../shared/decorator/body-type.decorator';

@Controller({
  path: 'config',
  version: '1',
})
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @BodyType(PublishConfigRequestSchema)
  @ResponseType(PublishConfigResponseModel)
  @UserHasPermission({ permission: { config: ['publish'] } })
  @Post('publish')
  async publish(
    @Body(new ZodValidationPipe(PublishConfigRequestSchema))
    request: PublishConfigRequest,
  ): Promise<PublishConfigResponseModel> {
    const [config, old] = await this.configService.publish(request.config);

    return {
      data: {
        config,
        oldConfig: old,
      },
    };
  }

  @ResponseType(ListConfigPaginatedResponseModel)
  @UserHasPermission({ permission: { config: ['get'] } })
  @Get()
  async listPaginated(
    @Query() query: FilterConfigDto,
  ): Promise<ListConfigPaginatedResponseModel> {
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

  @ResponseType(ListConfigResponseModel)
  @UserHasPermission({ permission: { config: ['get'] } })
  @Get('query-group')
  async listGroup(
    @Query() query: GetGroupRequest,
  ): Promise<ListConfigResponseModel> {
    console.log({ query });
    const configs = await this.configService.listGroup(query);
    return {
      data: {
        configs,
      },
    };
  }

  @ResponseType(GetConfigResponse)
  @UserHasPermission({ permission: { config: ['get'] } })
  @Get('query-one')
  async getConfig(
    @Query() query: GetConfigRequest,
  ): Promise<GetConfigResponse> {
    const config = await this.configService.get(query);
    return {
      data: {
        config,
      },
    };
  }
}
