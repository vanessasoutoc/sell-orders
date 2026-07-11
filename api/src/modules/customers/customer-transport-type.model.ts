import { Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Customer } from './customer.model';
import { TransportType } from '../transport-types/transport-type.model';

@Table({ tableName: 'customer_transport_types', timestamps: false })
export class CustomerTransportType extends Model {
  @ForeignKey(() => Customer)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare customerId: number;

  @ForeignKey(() => TransportType)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare transportTypeId: number;

  @Column({ type: DataType.BOOLEAN, allowNull: false })
  declare active: boolean;
}
