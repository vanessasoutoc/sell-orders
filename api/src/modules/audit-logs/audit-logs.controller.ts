import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuditLogsService } from './audit-logs.service';
import { PaginationDto } from '../../common/pagination.dto';

@ApiTags('Audit Logs')
@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly service: AuditLogsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os logs de auditoria' })
  @ApiResponse({ status: 200, description: 'Lista retornada com sucesso.' })
  findAll(@Query() { page, limit }: PaginationDto) {
    return this.service.findAll(Number(page), Number(limit));
  }
}
