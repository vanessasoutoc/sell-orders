import {
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  HasOne,
  Model,
  Table,
} from 'sequelize-typescript';
import { Customer } from '../customers/customer.model';
import { TransportType } from '../transport-types/transport-type.model';
import { OrderStatus } from '../order-status/order-status.model';
import { Item } from '../items/item.model';
import { OrderItem } from './order-item.model';
import { Appointment } from '../appointments/appointment.model';

@Table({ tableName: 'orders' })
export class Order extends Model {
  @ForeignKey(() => Customer)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare customerId: number;

  @BelongsTo(() => Customer)
  declare customer: Customer;

  @ForeignKey(() => TransportType)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare transportTypeId: number;

  @BelongsTo(() => TransportType)
  declare transportType: TransportType;

  @ForeignKey(() => OrderStatus)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare orderStatusId: number;

  @BelongsTo(() => OrderStatus)
  declare orderStatus: OrderStatus;

  @HasOne(() => Appointment)
  declare appointment: Appointment;

  @BelongsToMany(() => Item, () => OrderItem)
  declare items: Array<Item & { OrderItem: OrderItem }>;
}
