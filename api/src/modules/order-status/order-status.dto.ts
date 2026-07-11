import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderStatusDto {
  @ApiProperty({ example: 'Criada' })
  name: string;

  @ApiProperty({ example: 'CRIADA' })
  status: string;
}

export class UpdateOrderStatusDto {
  @ApiPropertyOptional({ example: 'Criada' })
  name?: string;

  @ApiPropertyOptional({ example: 'CRIADA' })
  status?: string;
}
