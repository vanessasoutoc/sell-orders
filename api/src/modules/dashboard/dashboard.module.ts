import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Order } from '../orders/order.model';
import { Customer } from '../customers/customer.model';
import { Appointment } from '../appointments/appointment.model';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';

@Module({
  imports: [SequelizeModule.forFeature([Order, Customer, Appointment])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
