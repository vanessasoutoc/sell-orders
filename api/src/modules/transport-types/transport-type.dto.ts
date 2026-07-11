import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTransportTypeDto {
  @ApiProperty({ example: 'Caminhão' })
  name: string;

  @ApiProperty({ example: 'CAMINHAO' })
  type: string;
}

export class UpdateTransportTypeDto {
  @ApiPropertyOptional({ example: 'Caminhão' })
  name?: string;

  @ApiPropertyOptional({ example: 'CAMINHAO' })
  type?: string;
}
