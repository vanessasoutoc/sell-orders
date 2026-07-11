import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuditLog } from './audit-log.model';
import { AuditLogsService } from './audit-logs.service';
import { AuditLogsController } from './audit-logs.controller';
import { AuditListener } from './audit.listener';

@Module({
  imports: [SequelizeModule.forFeature([AuditLog])],
  controllers: [AuditLogsController],
  providers: [AuditLogsService, AuditListener],
  exports: [AuditLogsService],
})
export class AuditLogsModule {}
