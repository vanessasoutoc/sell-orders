import { OnEvent } from '@nestjs/event-emitter';
import { Injectable } from '@nestjs/common';
import { AuditEvent } from './audit.event';
import { AuditLogsService } from './audit-logs.service';

@Injectable()
export class AuditListener {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @OnEvent('audit.*')
  async handle(event: AuditEvent) {
    await this.auditLogsService.log(
      event.entity,
      event.entityId,
      event.action,
      event.before,
      event.after,
      event.ip,
      event.metadata,
    );
  }
}
