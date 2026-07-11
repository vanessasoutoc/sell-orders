import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({ tableName: 'order_status' })
export class OrderStatus extends Model {
  @Column({ type: DataType.STRING, allowNull: false })
  declare name: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare status: string;
}
