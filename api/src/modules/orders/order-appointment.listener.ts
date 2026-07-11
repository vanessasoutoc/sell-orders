import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/sequelize';
import { Order } from './order.model';
import { AppointmentCreatedEvent } from '../appointments/appointment-created.event';

@Injectable()
export class OrderAppointmentListener {
  constructor(@InjectModel(Order) private readonly orderModel: typeof Order) {}

  @OnEvent('appointment.created')
  async handle(event: AppointmentCreatedEvent) {
    await this.orderModel.update({ appointment: true }, { where: { id: event.orderId } });
  }
}
