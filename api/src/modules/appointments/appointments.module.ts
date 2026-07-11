import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Appointment } from './appointment.model';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { AppointmentConfirmedListener } from './appointment-confirmed.listener';
import { Order } from '../orders/order.model';
import { AppointmentStatus } from '../appointment-status/appointment-status.model';
import { OrdersModule } from '../orders/orders.module';
import { Customer } from '../customers/customer.model';

@Module({
  imports: [
    SequelizeModule.forFeature([Appointment, Order, AppointmentStatus, Customer]),
    OrdersModule,
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService, AppointmentConfirmedListener],
})
export class AppointmentsModule {}
