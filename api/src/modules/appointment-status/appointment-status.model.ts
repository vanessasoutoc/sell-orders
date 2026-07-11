import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({ tableName: 'appointment_status' })
export class AppointmentStatus extends Model {
  @Column({ type: DataType.STRING, allowNull: false })
  declare name: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare status: string;
}
