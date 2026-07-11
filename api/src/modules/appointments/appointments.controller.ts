import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto, UpdateAppointmentDto } from './appointment.dto';
import { PaginationDto } from '../../common/pagination.dto';

@ApiTags('Appointments')
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly service: AppointmentsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os agendamentos' })
  @ApiResponse({ status: 200, description: 'Lista retornada com sucesso.' })
  findAll(@Query() { page, limit }: PaginationDto) {
    return this.service.findAll(Number(page), Number(limit));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar agendamento por ID' })
  @ApiResponse({ status: 200, description: 'Agendamento encontrado.' })
  @ApiResponse({ status: 404, description: 'Agendamento não encontrado.' })
  findOne(@Param('id') id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar novo agendamento' })
  @ApiResponse({ status: 201, description: 'Agendamento criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Data de entrega deve ser futura.' })
  @ApiResponse({ status: 404, description: 'Ordem não encontrada.' })
  create(@Body() body: CreateAppointmentDto, @Req() req: Request) {
    return this.service.create(body, req.ip);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar agendamento' })
  @ApiResponse({ status: 200, description: 'Agendamento atualizado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Data de entrega deve ser futura.' })
  @ApiResponse({ status: 404, description: 'Agendamento não encontrado.' })
  update(@Param('id') id: number, @Body() body: UpdateAppointmentDto, @Req() req: Request) {
    return this.service.update(id, body, req.ip);
  }

  @Patch(':id/confirm')
  @ApiOperation({ summary: 'Confirmar agendamento' })
  @ApiResponse({ status: 200, description: 'Agendamento confirmado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Agendamento não encontrado.' })
  confirm(@Param('id') id: number, @Req() req: Request) {
    return this.service.confirm(id, req.ip);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover agendamento' })
  @ApiResponse({ status: 200, description: 'Agendamento removido com sucesso.' })
  @ApiResponse({ status: 404, description: 'Agendamento não encontrado.' })
  remove(@Param('id') id: number, @Req() req: Request) {
    return this.service.remove(id, req.ip);
  }
}
