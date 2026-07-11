import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CustomerTransportTypeDto {
  @ApiProperty({ example: 1 })
  transportTypeId: number;

  @ApiProperty({ example: true })
  active: boolean;
}

export class CreateCustomerDto {
  @ApiProperty({ example: 'João Silva' })
  name: string;

  @ApiProperty({ example: '(11) 99999-9999' })
  cellphone: string;

  @ApiProperty({ example: 'joao@email.com' })
  email: string;

  @ApiPropertyOptional({ type: [CustomerTransportTypeDto] })
  transportTypes?: CustomerTransportTypeDto[];
}

export class UpdateCustomerDto {
  @ApiPropertyOptional({ example: 'João Silva' })
  name?: string;

  @ApiPropertyOptional({ example: '(11) 99999-9999' })
  cellphone?: string;

  @ApiPropertyOptional({ example: 'joao@email.com' })
  email?: string;

  @ApiPropertyOptional({ type: [CustomerTransportTypeDto] })
  transportTypes?: CustomerTransportTypeDto[];
}
