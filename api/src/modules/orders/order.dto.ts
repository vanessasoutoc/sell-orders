import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OrderItemDto {
  @ApiProperty({ example: 1 })
  itemId: number;

  @ApiProperty({ example: 2 })
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({ example: 1 })
  customerId: number;

  @ApiProperty({ example: 1 })
  transportTypeId: number;

  @ApiProperty({ example: 1 })
  orderStatusId: number;

  @ApiProperty({ type: [OrderItemDto] })
  items: OrderItemDto[];
}

export class FilterOrderDto {
  @ApiPropertyOptional({ example: 1, description: 'ID do status da ordem' })
  orderStatusId?: number;

  @ApiPropertyOptional({ example: 1, description: 'ID do cliente' })
  customerId?: number;

  @ApiPropertyOptional({ example: 1, description: 'ID do tipo de transporte' })
  transportTypeId?: number;

  @ApiPropertyOptional({ example: '2026-07-10', description: 'Data de criação (YYYY-MM-DD)' })
  date?: string;

  @ApiPropertyOptional({ enum: ['asc', 'desc'], example: 'desc', description: 'Ordenação por createdAt' })
  sortOrder?: 'asc' | 'desc';
}

export class UpdateOrderDto {
  @ApiPropertyOptional({ example: 1 })
  customerId?: number;

  @ApiPropertyOptional({ example: 1 })
  transportTypeId?: number;

  @ApiPropertyOptional({ example: 1 })
  orderStatusId?: number;

  @ApiPropertyOptional({ type: [OrderItemDto] })
  items?: OrderItemDto[];
}
