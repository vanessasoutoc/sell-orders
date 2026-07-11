import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Order } from '../orders/order.model';
import { Customer } from '../customers/customer.model';
import { Appointment } from '../appointments/appointment.model';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Order) private orderModel: typeof Order,
    @InjectModel(Customer) private customerModel: typeof Customer,
    @InjectModel(Appointment) private appointmentModel: typeof Appointment,
  ) {}

  async getSummary() {
    const [orders, customers, appointments] = await Promise.all([
      this.orderModel.count(),
      this.customerModel.count(),
      this.appointmentModel.count(),
    ]);
    return { orders, customers, appointments };
  }
}
