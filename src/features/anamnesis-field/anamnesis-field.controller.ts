import { Controller } from '@nestjs/common';
import { RequireActiveOrg } from '@thallesp/nestjs-better-auth';

@Controller({
  path: 'anamnesis-field',
  version: '1',
})
@RequireActiveOrg()
export class AnamnesisFieldController {}
