import { Injectable } from '@nestjs/common';
import { AuthService as BetterAuthService } from '@thallesp/nestjs-better-auth';
import { auth } from './auth';

@Injectable()
export class AuthService extends BetterAuthService<typeof auth> {}
