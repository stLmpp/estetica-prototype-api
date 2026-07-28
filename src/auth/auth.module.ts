import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthValidationService } from './auth-validation.service';

@Module({
  providers: [AuthService, AuthValidationService],
  exports: [AuthService, AuthValidationService],
})
@Global()
export class AuthModule {}
