import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAppointmentDto {
  @ApiProperty({ example: 1 })
  orderId: number;

  @ApiProperty({ example: 1, description: 'ID do status do agendamento' })
  appointmentStatusId: number;

  @ApiProperty({ example: '2026-12-31', description: 'Data de entrega futura (YYYY-MM-DD)' })
  deliveryDate: string;

  @ApiProperty({ example: '08:00:00' })
  startTime: string;

  @ApiProperty({ example: '12:00:00' })
  endTime: string;
}

export class UpdateAppointmentDto {
  @ApiPropertyOptional({ example: 1 })
  orderId?: number;

  @ApiPropertyOptional({ example: 1, description: 'ID do status do agendamento' })
  appointmentStatusId?: number;

  @ApiPropertyOptional({ example: '2026-12-31', description: 'Data de entrega futura (YYYY-MM-DD)' })
  deliveryDate?: string;

  @ApiPropertyOptional({ example: '08:00:00' })
  startTime?: string;

  @ApiPropertyOptional({ example: '12:00:00' })
  endTime?: string;
}
