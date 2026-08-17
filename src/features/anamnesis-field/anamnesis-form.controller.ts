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
import { AnamnesisFormService } from './anamnesis-form.service';
import { ResponseType } from '../../shared/decorator/response-type.decorator';
import { CreateAnamnesisFormRequest } from './dto/input/create-anamnesis-form.request';
import { CreateAnamnesisFormResponseModel } from './dto/output/create-anamnesis-form.response';
import { UpdateAnamnesisFormRequest } from './dto/input/update-anamnesis-form.request';
import { FilterAnamnesisFormDto } from './dto/input/list-anamnesis-form.request';
import { ListAnamnesisFormResponseModel } from './dto/output/list-anamnesis-form.response';
import { GetAnamnesisFormResponseModel } from './dto/output/get-anamnesis-form.response';
import { HasPermission } from '../../core/auth/has-permission.decorator';

@Controller({
  path: 'anamnesis-form',
  version: '1',
})
@RequireActiveOrg()
export class AnamnesisFormController {
  constructor(private readonly anamnesisFormService: AnamnesisFormService) {}

  @ResponseType(CreateAnamnesisFormResponseModel, 201)
  @Post()
  @HasPermission({ orgPermissions: { anamnesisField: ['create'] } })
  async create(
    @Body() body: CreateAnamnesisFormRequest,
  ): Promise<CreateAnamnesisFormResponseModel> {
    const anamnesisForm = await this.anamnesisFormService.create(
      body.anamnesisForm,
    );
    return { data: { anamnesisForm } };
  }

  @Patch(':anamnesisFormId')
  @HasPermission({ orgPermissions: { anamnesisField: ['update'] } })
  async update(
    @Param('anamnesisFormId') anamnesisFormId: string,
    @Body() body: UpdateAnamnesisFormRequest,
  ): Promise<void> {
    await this.anamnesisFormService.update(anamnesisFormId, body.anamnesisForm);
  }

  @Delete(':anamnesisFormId')
  @HasPermission({ orgPermissions: { anamnesisField: ['delete'] } })
  async delete(
    @Param('anamnesisFormId') anamnesisFormId: string,
  ): Promise<void> {
    await this.anamnesisFormService.delete(anamnesisFormId);
  }

  @ResponseType(ListAnamnesisFormResponseModel)
  @Get()
  @HasPermission({ orgPermissions: { anamnesisField: ['get'] } })
  async listPaginated(
    @Query() query: FilterAnamnesisFormDto,
  ): Promise<ListAnamnesisFormResponseModel> {
    const { anamnesisForms, count } =
      await this.anamnesisFormService.listPaginated(query);
    return {
      data: { items: anamnesisForms },
      meta: {
        total: count,
        limit: query.limit,
        page: query.page,
      },
    };
  }

  @ResponseType(GetAnamnesisFormResponseModel)
  @Get(':anamnesisFormId')
  @HasPermission({ orgPermissions: { anamnesisField: ['get'] } })
  async getById(
    @Param('anamnesisFormId') anamnesisFormId: string,
  ): Promise<GetAnamnesisFormResponseModel> {
    const anamnesisForm =
      await this.anamnesisFormService.getById(anamnesisFormId);
    return { data: { anamnesisForm } };
  }
}
