import { Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Order } from './order.model';
import { Item } from '../items/item.model';

@Table({ tableName: 'order_items' })
export class OrderItem extends Model {
  @ForeignKey(() => Order)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare orderId: number;

  @ForeignKey(() => Item)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare itemId: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 1 })
  declare quantity: number;
}
