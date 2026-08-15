import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthValidationService } from './auth-validation.service';
import { MainDatabaseModule } from '../../database/main/main-database.module';
import { AuthDataService } from './auth-data.service';
import { OrganizationService } from './organization.service';

@Module({
  imports: [MainDatabaseModule],
  providers: [
    AuthService,
    AuthValidationService,
    OrganizationService,
    {
      provide: AuthDataService,
      useValue: AuthDataService.instance,
    },
  ],
  exports: [
    AuthService,
    AuthValidationService,
    OrganizationService,
    AuthDataService,
  ],
})
@Global()
export class AuthModule {}
