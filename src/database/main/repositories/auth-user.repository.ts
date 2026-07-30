import { Injectable } from '@nestjs/common';
import { Repository } from './repository';

@Injectable()
export class AuthUserRepository extends Repository {
  findFirstById(userId: string) {
    return this.db.query.authUser.findFirst({
      columns: {
        id: true,
      },
      where: {
        id: userId,
      },
    });
  }
}
