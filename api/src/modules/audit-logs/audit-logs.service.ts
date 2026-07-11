import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AuditLog } from './audit-log.model';
import { paginate, PaginatedResult } from '../../common/pagination.dto';

@Injectable()
export class AuditLogsService {
  constructor(@InjectModel(AuditLog) private readonly model: typeof AuditLog) {}

  async findAll(page = 1, limit = 10): Promise<PaginatedResult<AuditLog>> {
    const offset = (page - 1) * limit;
    const { rows, count } = await this.model.findAndCountAll({ limit, offset, order: [['createdAt', 'DESC']] });
    return paginate(rows, count, page, limit);
  }

  async create(auditLog: Partial<AuditLog>): Promise<AuditLog> {
    return this.model.create(auditLog as any);
  }

  log(
    entity: string,
    entityId: number,
    action: string,
    before: object | null,
    after: object | null,
    ip?: string,
    metadata?: object,
  ) {
    return this.model.create({ entity, entityId, action, before, after, ip, metadata } as any);
  }
}
