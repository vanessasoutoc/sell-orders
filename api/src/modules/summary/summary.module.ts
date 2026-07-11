import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Order } from '../orders/order.model';
import { Customer } from '../customers/customer.model';
import { Appointment } from '../appointments/appointment.model';
import { SummaryService } from './summary.service';
import { SummaryController } from './summary.controller';

@Module({
  imports: [SequelizeModule.forFeature([Order, Customer, Appointment])],
  controllers: [SummaryController],
  providers: [SummaryService],
})
export class SummaryModule {}
