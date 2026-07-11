import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateItemDto {
  @ApiProperty({ example: 'Pneu R14' })
  name: string;

  @ApiPropertyOptional({ example: 'Pneu aro 14' })
  description?: string;
}

export class UpdateItemDto {
  @ApiPropertyOptional({ example: 'Pneu R14' })
  name?: string;

  @ApiPropertyOptional({ example: 'Pneu aro 14' })
  description?: string;
}
