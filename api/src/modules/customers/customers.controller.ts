import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto } from './customer.dto';
import { PaginationDto } from '../../common/pagination.dto';

@ApiTags('Customers')
@Controller('customers')
export class CustomersController {
  constructor(private readonly service: CustomersService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os clientes' })
  @ApiResponse({ status: 200, description: 'Lista de clientes retornada com sucesso.' })
  findAll(@Query() { page, limit }: PaginationDto) {
    return this.service.findAll(Number(page), Number(limit));
  }

  @Get('autocomplete')
  @ApiOperation({ summary: 'Autocomplete de clientes por nome' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  autocomplete(
    @Query('search') search = '',
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.service.autocomplete(search, Number(page), Number(limit));
  }

  @Get(':id/transport-types')
  @ApiOperation({ summary: 'Listar todos os tipos de transporte do cliente com flag active' })
  @ApiResponse({ status: 200, description: 'Lista retornada com sucesso.' })
  getTransportTypes(@Param('id') id: number) {
    return this.service.getTransportTypes(Number(id));
  }

  @Get(':id/transport-types/active')
  @ApiOperation({ summary: 'Listar apenas tipos de transporte ativos do cliente' })
  @ApiResponse({ status: 200, description: 'Lista retornada com sucesso.' })
  getActiveTransportTypes(@Param('id') id: number) {
    return this.service.getActiveTransportTypes(Number(id));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar cliente por ID' })
  @ApiResponse({ status: 200, description: 'Cliente encontrado.' })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado.' })
  findOne(@Param('id') id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar novo cliente' })
  @ApiResponse({ status: 201, description: 'Cliente criado com sucesso.' })
  create(@Body() body: CreateCustomerDto, @Req() req: Request) {
    return this.service.create(body, req.ip);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar cliente' })
  @ApiResponse({ status: 200, description: 'Cliente atualizado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado.' })
  update(@Param('id') id: number, @Body() body: UpdateCustomerDto, @Req() req: Request) {
    return this.service.update(id, body, req.ip);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover cliente' })
  @ApiResponse({ status: 200, description: 'Cliente removido com sucesso.' })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado.' })
  remove(@Param('id') id: number, @Req() req: Request) {
    return this.service.remove(id, req.ip);
  }
}
