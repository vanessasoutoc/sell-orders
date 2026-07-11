import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({ tableName: 'transport_types' })
export class TransportType extends Model {
  @Column({ type: DataType.STRING, allowNull: false })
  declare name: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare type: string;
}
