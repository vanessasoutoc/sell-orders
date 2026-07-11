import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Order } from '../orders/order.model';
import { AppointmentStatus } from '../appointment-status/appointment-status.model';

@Table({ tableName: 'appointments' })
export class Appointment extends Model {
  @ForeignKey(() => Order)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare orderId: number;

  @BelongsTo(() => Order)
  declare order: Order;

  @ForeignKey(() => AppointmentStatus)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare appointmentStatusId: number;

  @BelongsTo(() => AppointmentStatus)
  declare appointmentStatus: AppointmentStatus;

  @Column({ type: DataType.DATEONLY, allowNull: false })
  declare deliveryDate: string;

  @Column({ type: DataType.TIME, allowNull: false })
  declare startTime: string;

  @Column({ type: DataType.TIME, allowNull: false })
  declare endTime: string;

  @Column({ type: DataType.DATE, allowNull: true })
  declare confirmedAt: Date | null;
}
