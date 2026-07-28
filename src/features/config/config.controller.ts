import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { Roles } from '@thallesp/nestjs-better-auth';
import { AuthRole } from '../../auth/auth';
import { PublishConfigRequest } from './dto/input/publish-config.request';
import { PublishConfigResponseModel } from './dto/output/publish-config.response';
import { ConfigService } from './config.service';
import { ResponseType } from '../../shared/decorator/response-type.decorator';
import { FilterConfigDto } from './dto/input/list-config.request';
import {
  ListConfigPaginatedResponseModel,
  ListConfigResponseModel,
} from './dto/output/list-config.response';
import { GetConfigResponse } from './dto/output/get-config.response';
import { z } from 'zod';
import { ZodValidationPipe } from 'nestjs-zod';
import { GetConfigRequest } from './dto/input/get-config.request';

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

  @ResponseType(ListConfigPaginatedResponseModel)
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
  @Get('group/:group')
  async listGroup(
    @Param('group', new ZodValidationPipe(z.string().trim().min(1).max(64)))
    group: string,
  ): Promise<ListConfigResponseModel> {
    const configs = await this.configService.listGroup(group);
    return {
      data: {
        configs,
      },
    };
  }

  @ResponseType(GetConfigResponse)
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
