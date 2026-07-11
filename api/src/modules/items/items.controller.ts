import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ItemsService } from './items.service';
import { CreateItemDto, UpdateItemDto } from './item.dto';
import { PaginationDto } from '../../common/pagination.dto';

@ApiTags('Items')
@Controller('items')
export class ItemsController {
  constructor(private readonly service: ItemsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os itens' })
  @ApiResponse({ status: 200, description: 'Lista retornada com sucesso.' })
  findAll(@Query() { page, limit }: PaginationDto) {
    return this.service.findAll(Number(page), Number(limit));
  }

  @Get('autocomplete')
  @ApiOperation({ summary: 'Autocomplete de itens por nome' })
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

  @Get(':id')
  @ApiOperation({ summary: 'Buscar item por ID' })
  @ApiResponse({ status: 200, description: 'Item encontrado.' })
  @ApiResponse({ status: 404, description: 'Item não encontrado.' })
  findOne(@Param('id') id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar novo item' })
  @ApiResponse({ status: 201, description: 'Item criado com sucesso.' })
  create(@Body() body: CreateItemDto) {
    return this.service.create(body);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar item' })
  @ApiResponse({ status: 200, description: 'Item atualizado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Item não encontrado.' })
  update(@Param('id') id: number, @Body() body: UpdateItemDto) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover item' })
  @ApiResponse({ status: 200, description: 'Item removido com sucesso.' })
  @ApiResponse({ status: 404, description: 'Item não encontrado.' })
  remove(@Param('id') id: number) {
    return this.service.remove(id);
  }
}
