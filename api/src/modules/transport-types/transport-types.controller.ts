import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TransportTypesService } from './transport-types.service';
import { CreateTransportTypeDto, UpdateTransportTypeDto } from './transport-type.dto';
import { PaginationDto } from '../../common/pagination.dto';

@ApiTags('Transport Types')
@Controller('transport-types')
export class TransportTypesController {
  constructor(private readonly service: TransportTypesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os tipos de transporte' })
  @ApiResponse({ status: 200, description: 'Lista retornada com sucesso.' })
  findAll(@Query() { page, limit }: PaginationDto) {
    return this.service.findAll(Number(page), Number(limit));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar tipo de transporte por ID' })
  @ApiResponse({ status: 200, description: 'Tipo encontrado.' })
  @ApiResponse({ status: 404, description: 'Tipo não encontrado.' })
  findOne(@Param('id') id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar novo tipo de transporte' })
  @ApiResponse({ status: 201, description: 'Tipo criado com sucesso.' })
  create(@Body() body: CreateTransportTypeDto) {
    return this.service.create(body);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar tipo de transporte' })
  @ApiResponse({ status: 200, description: 'Tipo atualizado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Tipo não encontrado.' })
  update(@Param('id') id: number, @Body() body: UpdateTransportTypeDto) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover tipo de transporte' })
  @ApiResponse({ status: 200, description: 'Tipo removido com sucesso.' })
  @ApiResponse({ status: 404, description: 'Tipo não encontrado.' })
  remove(@Param('id') id: number) {
    return this.service.remove(id);
  }
}
