import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { RequireActiveOrg } from '@thallesp/nestjs-better-auth';
import { AnamnesisFieldService } from './anamnesis-field.service';
import { AnamnesisFieldReadService } from './anamnesis-field-read.service';
import { ResponseType } from '../../shared/decorator/response-type.decorator';
import { CreateAnamnesisFieldRequest } from './dto/input/create-anamnesis-field.request';
import { CreateAnamnesisFieldResponseModel } from './dto/output/create-anamnesis-field.response';
import { UpdateAnamnesisFieldRequest } from './dto/input/update-anamnesis-field.request';
import { FilterAnamnesisFieldDto } from './dto/input/list-anamnesis-field.request';
import { ListAnamnesisFieldResponseModel } from './dto/output/list-anamnesis-field.response';
import { GetAnamnesisFieldResponseModel } from './dto/output/get-anamnesis-field.response';
import { HasPermission } from '../../core/auth/has-permission.decorator';

@Controller({
  path: 'anamnesis-field',
  version: '1',
})
@RequireActiveOrg()
export class AnamnesisFieldController {
  constructor(
    private readonly anamnesisFieldService: AnamnesisFieldService,
    private readonly anamnesisFieldReadService: AnamnesisFieldReadService,
  ) {}

  @ResponseType(CreateAnamnesisFieldResponseModel, 201)
  @Post()
  @HasPermission({ orgPermissions: { anamnesisField: ['create'] } })
  async create(
    @Body() body: CreateAnamnesisFieldRequest,
  ): Promise<CreateAnamnesisFieldResponseModel> {
    const anamnesisField = await this.anamnesisFieldService.create(
      body.anamnesisField,
    );
    return { data: { anamnesisField } };
  }

  @Patch(':anamnesisFieldId')
  @HasPermission({ orgPermissions: { anamnesisField: ['update'] } })
  async update(
    @Param('anamnesisFieldId') anamnesisFieldId: string,
    @Body() body: UpdateAnamnesisFieldRequest,
  ): Promise<void> {
    await this.anamnesisFieldService.update(
      anamnesisFieldId,
      body.anamnesisField,
    );
  }

  @Delete(':anamnesisFieldId')
  @HasPermission({ orgPermissions: { anamnesisField: ['delete'] } })
  async delete(
    @Param('anamnesisFieldId') anamnesisFieldId: string,
  ): Promise<void> {
    await this.anamnesisFieldService.delete(anamnesisFieldId);
  }

  @ResponseType(ListAnamnesisFieldResponseModel)
  @Get()
  @HasPermission({ orgPermissions: { anamnesisField: ['get'] } })
  async listPaginated(
    @Query() query: FilterAnamnesisFieldDto,
  ): Promise<ListAnamnesisFieldResponseModel> {
    const { anamnesisFields, count } =
      await this.anamnesisFieldService.listPaginated(query);
    return {
      data: { items: anamnesisFields },
      meta: {
        total: count,
        limit: query.limit,
        page: query.page,
      },
    };
  }

  @ResponseType(GetAnamnesisFieldResponseModel)
  @Get(':anamnesisFieldId')
  @HasPermission({ orgPermissions: { anamnesisField: ['get'] } })
  async getById(
    @Param('anamnesisFieldId') anamnesisFieldId: string,
  ): Promise<GetAnamnesisFieldResponseModel> {
    const anamnesisField =
      await this.anamnesisFieldReadService.requireWithValidations(
        anamnesisFieldId,
      );
    return { data: { anamnesisField } };
  }
}
