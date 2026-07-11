import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAppointmentStatusDto {
  @ApiProperty({ example: 'Pendente' })
  name: string;

  @ApiProperty({ example: 'PENDENTE' })
  status: string;
}

export class UpdateAppointmentStatusDto {
  @ApiPropertyOptional({ example: 'Pendente' })
  name?: string;

  @ApiPropertyOptional({ example: 'PENDENTE' })
  status?: string;
}
