import { OnEvent } from '@nestjs/event-emitter';
import { Injectable } from '@nestjs/common';
import { AppointmentConfirmedEvent } from './appointment-confirmed.event';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class AppointmentConfirmedListener {
  constructor(private readonly ordersService: OrdersService) {}

  @OnEvent('appointment.confirmed')
  async handle(event: AppointmentConfirmedEvent) {
    await this.ordersService.changeStatus(event.entityId, 'AGENDADA');
  }
}
