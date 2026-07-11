import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Order } from './order.model';
import { OrderItem } from './order-item.model';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { OrderAppointmentListener } from './order-appointment.listener';
import { Customer } from '../customers/customer.model';
import { TransportType } from '../transport-types/transport-type.model';
import { OrderStatus } from '../order-status/order-status.model';
import { Item } from '../items/item.model';
import { Appointment } from '../appointments/appointment.model';
import { AppointmentStatus } from '../appointment-status/appointment-status.model';

@Module({
  imports: [SequelizeModule.forFeature([Order, OrderItem, Customer, TransportType, OrderStatus, Item, Appointment, AppointmentStatus])],
  controllers: [OrdersController],
  providers: [OrdersService, OrderAppointmentListener],
  exports: [OrdersService],
})
export class OrdersModule {}
