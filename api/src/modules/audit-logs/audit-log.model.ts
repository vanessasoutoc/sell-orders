import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({ tableName: 'audit_logs' })
export class AuditLog extends Model {
  @Column({ type: DataType.STRING, allowNull: false })
  declare entity: string;

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare entityId: number;

  @Column({ type: DataType.STRING, allowNull: false })
  declare action: string;

  @Column({ type: DataType.JSON, allowNull: true })
  declare before: object | null;

  @Column({ type: DataType.JSON, allowNull: true })
  declare after: object | null;

  @Column({ type: DataType.STRING, allowNull: true })
  declare ip: string | null;

  @Column({ type: DataType.JSON, allowNull: true })
  declare metadata: object | null;

  @Column({ type: DataType.DATE, allowNull: false, defaultValue: DataType.NOW })
  declare occurredAt: Date;
}
