import { Module } from '@nestjs/common';
import { MainDatabaseModule } from '../../database/main/main-database.module';
import { AnamnesisFieldReadModule } from './anamnesis-field-read.module';
import { AnamnesisFormController } from './anamnesis-form.controller';
import { AnamnesisFormService } from './anamnesis-form.service';
import { AnamnesisSectionController } from './anamnesis-section.controller';
import { AnamnesisSectionService } from './anamnesis-section.service';
import { AnamnesisFieldController } from './anamnesis-field.controller';
import { AnamnesisFieldService } from './anamnesis-field.service';

@Module({
  imports: [MainDatabaseModule, AnamnesisFieldReadModule],
  controllers: [
    AnamnesisFormController,
    AnamnesisSectionController,
    AnamnesisFieldController,
  ],
  providers: [
    AnamnesisFormService,
    AnamnesisSectionService,
    AnamnesisFieldService,
  ],
})
export class AnamnesisFieldModule {}
