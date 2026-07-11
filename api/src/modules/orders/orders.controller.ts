import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto, FilterOrderDto, UpdateOrderDto } from './order.dto';
import { PaginationDto } from '../../common/pagination.dto';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly service: OrdersService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas as ordens' })
  @ApiResponse({ status: 200, description: 'Lista retornada com sucesso.' })
  findAll(@Query() { page, limit }: PaginationDto, @Query() filters: FilterOrderDto) {
    return this.service.findAll(Number(page), Number(limit), filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar ordem por ID' })
  @ApiResponse({ status: 200, description: 'Ordem encontrada.' })
  @ApiResponse({ status: 404, description: 'Ordem não encontrada.' })
  findOne(@Param('id') id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar nova ordem' })
  @ApiResponse({ status: 201, description: 'Ordem criada com sucesso.' })
  create(@Body() body: CreateOrderDto, @Req() req: Request) {
    return this.service.create(body, req.ip);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar ordem' })
  @ApiResponse({ status: 200, description: 'Ordem atualizada com sucesso.' })
  @ApiResponse({ status: 404, description: 'Ordem não encontrada.' })
  update(@Param('id') id: number, @Body() body: UpdateOrderDto, @Req() req: Request) {
    return this.service.update(id, body, req.ip);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover ordem' })
  @ApiResponse({ status: 200, description: 'Ordem removida com sucesso.' })
  @ApiResponse({ status: 404, description: 'Ordem não encontrada.' })
  remove(@Param('id') id: number, @Req() req: Request) {
    return this.service.remove(id, req.ip);
  }
}
