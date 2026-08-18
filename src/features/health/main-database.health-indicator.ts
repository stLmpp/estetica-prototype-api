import { Injectable, Scope } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';
import { sql } from 'drizzle-orm';
import { MainDatasource } from '../../database/main/main-database-connection';

@Injectable({ scope: Scope.TRANSIENT })
export class MainDatabaseHealthIndicator {
  constructor(
    private readonly mainDatasource: MainDatasource,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  async pingCheck<Key extends string>(key: Key) {
    const check = this.healthIndicatorService.check(key);
    try {
      await this.mainDatasource.execute(sql`select 1`);
    } catch {
      return check.down('Unable to reach the database');
    }
    return check.up();
  }
}
