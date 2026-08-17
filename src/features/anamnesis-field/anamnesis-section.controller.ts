import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { RequireActiveOrg } from '@thallesp/nestjs-better-auth';
import { AnamnesisSectionService } from './anamnesis-section.service';
import { ResponseType } from '../../shared/decorator/response-type.decorator';
import { CreateAnamnesisSectionRequest } from './dto/input/create-anamnesis-section.request';
import { CreateAnamnesisSectionResponseModel } from './dto/output/create-anamnesis-section.response';
import { UpdateAnamnesisSectionRequest } from './dto/input/update-anamnesis-section.request';
import { UpdateAnamnesisSectionResponseModel } from './dto/output/update-anamnesis-section.response';
import { ListAnamnesisSectionResponseModel } from './dto/output/list-anamnesis-section.response';
import { HasPermission } from '../../core/auth/has-permission.decorator';

@Controller({
  path: 'anamnesis-form/:anamnesisFormId/section',
  version: '1',
})
@RequireActiveOrg()
export class AnamnesisSectionController {
  constructor(
    private readonly anamnesisSectionService: AnamnesisSectionService,
  ) {}

  @ResponseType(CreateAnamnesisSectionResponseModel, 201)
  @Post()
  @HasPermission({ orgPermissions: { anamnesisField: ['create'] } })
  async create(
    @Param('anamnesisFormId') anamnesisFormId: string,
    @Body() body: CreateAnamnesisSectionRequest,
  ): Promise<CreateAnamnesisSectionResponseModel> {
    const anamnesisSection = await this.anamnesisSectionService.create(
      anamnesisFormId,
      body.anamnesisSection,
    );
    return { data: { anamnesisSection } };
  }

  @ResponseType(UpdateAnamnesisSectionResponseModel)
  @Patch(':anamnesisSectionId')
  @HasPermission({ orgPermissions: { anamnesisField: ['update'] } })
  async update(
    @Param('anamnesisFormId') anamnesisFormId: string,
    @Param('anamnesisSectionId') anamnesisSectionId: string,
    @Body() body: UpdateAnamnesisSectionRequest,
  ): Promise<UpdateAnamnesisSectionResponseModel> {
    const anamnesisSection = await this.anamnesisSectionService.update(
      anamnesisFormId,
      anamnesisSectionId,
      body.anamnesisSection,
    );
    return { data: { anamnesisSection } };
  }

  @Delete(':anamnesisSectionId')
  @HasPermission({ orgPermissions: { anamnesisField: ['delete'] } })
  async delete(
    @Param('anamnesisFormId') anamnesisFormId: string,
    @Param('anamnesisSectionId') anamnesisSectionId: string,
  ): Promise<void> {
    await this.anamnesisSectionService.delete(
      anamnesisFormId,
      anamnesisSectionId,
    );
  }

  @ResponseType(ListAnamnesisSectionResponseModel)
  @Get()
  @HasPermission({ orgPermissions: { anamnesisField: ['get'] } })
  async listByForm(
    @Param('anamnesisFormId') anamnesisFormId: string,
  ): Promise<ListAnamnesisSectionResponseModel> {
    const anamnesisSections =
      await this.anamnesisSectionService.listByForm(anamnesisFormId);
    return { data: { anamnesisSections } };
  }
}
