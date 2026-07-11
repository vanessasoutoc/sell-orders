import { BelongsToMany, Column, DataType, Model, Table } from 'sequelize-typescript';
import { TransportType } from '../transport-types/transport-type.model';
import { CustomerTransportType } from './customer-transport-type.model';

@Table({ tableName: 'customers' })
export class Customer extends Model {
  @Column({ type: DataType.STRING, allowNull: false })
  declare name: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare cellphone: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare email: string;

  @BelongsToMany(() => TransportType, () => CustomerTransportType)
  declare transportTypes: TransportType[];
}
