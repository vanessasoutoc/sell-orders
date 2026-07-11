import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({ tableName: 'items' })
export class Item extends Model {
  @Column({ type: DataType.STRING, allowNull: false })
  declare name: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare description: string;
}
