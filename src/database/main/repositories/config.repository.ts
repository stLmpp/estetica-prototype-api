import { Injectable } from '@nestjs/common';
import { Repository } from './repository';
import {
  and,
  asc,
  desc,
  eq,
  getColumns,
  isNull,
  lte,
  or,
  sql,
} from 'drizzle-orm';
import { FilterConfigDto } from '../../../features/config/dto/input/list-config.request';
import { promiseAllObject } from '../../../shared/utils/promise-all-object';
import { GetGroupRequest } from '../../../features/config/dto/input/get-group.request';
import { AuthDataService } from '../../../auth/auth-data.service';
import {
  InjectTransactionHost,
  TransactionHost,
} from '@nestjs-cls/transactional';
import { MAIN_DATABASE_CONNECTION_NAME } from '../main-database-connection-name';
import { TransactionalAdapterDrizzleOrm } from '@nestjs-cls/transactional-adapter-drizzle-orm';
import { MainDatasource } from '../main-database-connection';
import { SecurityLevelType } from '../../../shared/domain/security-level-type.enum';

interface AllPossibleParams {
  name: string;
  version: number | 'latest';
  params: PossibleConfigParams[];
}

export interface PossibleConfigParams {
  order: number;
  userId: string;
  tenantId: string;
  group: string;
}

@Injectable()
export class ConfigRepository extends Repository {
  constructor(
    @InjectTransactionHost(MAIN_DATABASE_CONNECTION_NAME)
    txHost: TransactionHost<TransactionalAdapterDrizzleOrm<MainDatasource>>,
    private readonly authDataService: AuthDataService,
  ) {
    super(txHost);
  }

  private getAuthorizedCondition() {
    const securityLevel = this.authDataService.getSessionSecurityLevel();
    const orgSecurityLevel = this.authDataService.getOrgSessionSecurityLevel();
    return or(
      isNull(this.db.e.config.requiredSecurityLevel),
      isNull(this.db.e.config.securityLevelType),
      and(
        eq(this.db.e.config.securityLevelType, SecurityLevelType.ORG),
        lte(this.db.e.config.requiredSecurityLevel, orgSecurityLevel),
      ),
      and(
        eq(this.db.e.config.securityLevelType, SecurityLevelType.GENERAL),
        lte(this.db.e.config.requiredSecurityLevel, securityLevel),
      ),
    );
  }

  async findFirstByParams({ params, name, version }: AllPossibleParams) {
    if (!params.length) {
      return null;
    }
    const [first, ...queries] = params.map((param) => {
      const where = [
        eq(this.db.e.config.name, name),
        eq(this.db.e.config.group, param.group),
        eq(this.db.e.config.userId, param.userId),
        eq(this.db.e.config.tenantId, param.tenantId),
        this.getAuthorizedCondition(),
      ];
      if (version === 'latest') {
        where.push(isNull(this.db.e.config.inactivatedAt));
      } else {
        where.push(eq(this.db.e.config.version, version));
      }
      return this.db
        .select({
          ...getColumns(this.db.e.config),
          order: sql`${param.order}`.mapWith(Number).as('order'),
        })
        .from(this.db.e.config)
        .where(and(...where));
    });
    const finalQuery = first!;
    for (const query of queries) {
      finalQuery.unionAll(query);
    }
    const alias = finalQuery.as('t');
    const [entity] = await this.db
      .select()
      .from(alias)
      .orderBy(asc(alias.order))
      .limit(1);
    return entity;
  }

  async findPaginated(dto: FilterConfigDto) {
    const where = and(
      eq(this.db.e.config.group, dto.group).if(dto.group),
      eq(this.db.e.config.name, dto.name!).if(dto.name),
      eq(this.db.e.config.tenantId, dto.tenantId).if(dto.tenantId),
      eq(this.db.e.config.userId, dto.userId).if(dto.userId),
      isNull(this.db.e.config.inactivatedAt).if(!dto.showInactivated),
      eq(this.db.e.config.version, dto.version!).if(dto.version),
      this.getAuthorizedCondition(),
    );
    const offset = (dto.page - 1) * dto.limit;
    const configs = this.db
      .select()
      .from(this.db.e.config)
      .where(where)
      .orderBy(desc(this.db.e.config.id))
      .limit(dto.limit)
      .offset(offset)
      .execute();
    const count = this.db
      .select({
        count: sql<number>`count(*)`.mapWith(Number),
      })
      .from(this.db.e.config)
      .where(where)
      .execute()
      .then((results) => results[0]?.count ?? 0);
    return promiseAllObject({ configs, count });
  }

  findByGroup(dto: GetGroupRequest) {
    const where = [
      eq(this.db.e.config.group, dto.group),
      eq(this.db.e.config.tenantId, dto.tenantId).if(dto.tenantId),
      eq(this.db.e.config.userId, dto.userId).if(dto.userId),
      isNull(this.db.e.config.inactivatedAt),
      this.getAuthorizedCondition(),
    ];

    return this.db
      .select()
      .from(this.db.e.config)
      .where(and(...where));
  }
}
