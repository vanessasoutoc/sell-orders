import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppointmentStatusService } from './appointment-status.service';
import { CreateAppointmentStatusDto, UpdateAppointmentStatusDto } from './appointment-status.dto';
import { PaginationDto } from '../../common/pagination.dto';

@ApiTags('Appointment Status')
@Controller('appointment-status')
export class AppointmentStatusController {
  constructor(private readonly service: AppointmentStatusService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os status de agendamento' })
  @ApiResponse({ status: 200, description: 'Lista retornada com sucesso.' })
  findAll(@Query() { page, limit }: PaginationDto) {
    return this.service.findAll(Number(page), Number(limit));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar status de agendamento por ID' })
  @ApiResponse({ status: 200, description: 'Status encontrado.' })
  @ApiResponse({ status: 404, description: 'Status não encontrado.' })
  findOne(@Param('id') id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar novo status de agendamento' })
  @ApiResponse({ status: 201, description: 'Status criado com sucesso.' })
  create(@Body() body: CreateAppointmentStatusDto) {
    return this.service.create(body);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar status de agendamento' })
  @ApiResponse({ status: 200, description: 'Status atualizado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Status não encontrado.' })
  update(@Param('id') id: number, @Body() body: UpdateAppointmentStatusDto) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover status de agendamento' })
  @ApiResponse({ status: 200, description: 'Status removido com sucesso.' })
  @ApiResponse({ status: 404, description: 'Status não encontrado.' })
  remove(@Param('id') id: number) {
    return this.service.remove(id);
  }
}
