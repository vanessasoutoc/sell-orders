import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Appointment } from './appointment.model';
import { Order } from '../orders/order.model';
import { AppointmentStatus } from '../appointment-status/appointment-status.model';
import { CreateAppointmentDto, UpdateAppointmentDto } from './appointment.dto';
import { paginate, PaginatedResult } from '../../common/pagination.dto';
import { AppointmentConfirmedEvent } from './appointment-confirmed.event';
import { AppointmentCreatedEvent } from './appointment-created.event';
import { AuditEvent } from '../audit-logs/audit.event';

import { Customer } from '../customers/customer.model';

const INCLUDE_ALL = [
  { model: Order, include: [{ model: Customer }] },
  { model: AppointmentStatus },
];

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectModel(Appointment) private readonly model: typeof Appointment,
    @InjectModel(Order) private readonly orderModel: typeof Order,
    @InjectModel(AppointmentStatus) private readonly statusModel: typeof AppointmentStatus,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findAll(page = 1, limit = 10): Promise<PaginatedResult<Appointment>> {
    const offset = (page - 1) * limit;
    const { rows, count } = await this.model.findAndCountAll({ include: INCLUDE_ALL, limit, offset });
    return paginate(rows, count, page, limit);
  }

  async findOne(id: number) {
    const record = await this.model.findByPk(id, { include: INCLUDE_ALL });
    if (!record) throw new NotFoundException('Appointment not found');
    return record;
  }

  async confirm(id: number, ip?: string) {
    const appointment = await this.findOne(id);
    const before = appointment.toJSON();
    const confirmed = await this.statusModel.findOne({ where: { status: 'CONFIRMADO' } });
    if (!confirmed) throw new NotFoundException('AppointmentStatus CONFIRMADO not found');
    await appointment.update({ appointmentStatusId: confirmed.id, confirmedAt: new Date() });
    this.eventEmitter.emit('appointment.confirmed', new AppointmentConfirmedEvent(appointment.orderId));
    const result = await this.findOne(id);
    this.eventEmitter.emit('audit.appointment', new AuditEvent('Appointment', id, 'CONFIRMADO', before, result.toJSON(), ip));
    return result;
  }

  private validateDeliveryDate(deliveryDate: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const delivery = new Date(deliveryDate);
    if (delivery <= today) {
      throw new BadRequestException('Data de Entrega não pode ser menor que a data atual');
    }
  }

  private async validateOrder(orderId: number) {
    const order = await this.orderModel.findByPk(orderId);
    if (!order) throw new NotFoundException(`Ordem com id ${orderId} não encontrada`);
  }

  private async validateStatus(appointmentStatusId: number) {
    const status = await this.statusModel.findByPk(appointmentStatusId);
    if (!status) throw new NotFoundException(`Status de agendamento com id ${appointmentStatusId} não encontrado`);
  }

  async create(data: CreateAppointmentDto, ip?: string) {
    this.validateDeliveryDate(data.deliveryDate);
    await this.validateOrder(data.orderId);
    await this.validateStatus(data.appointmentStatusId);
    const record = await this.model.create(data as any);
    const result = await this.findOne(record.id);
    this.eventEmitter.emit('appointment.created', new AppointmentCreatedEvent(data.orderId));
    this.eventEmitter.emit('audit.appointment', new AuditEvent('Appointment', record.id, 'CRIADA', null, result.toJSON(), ip));
    return result;
  }

  async update(id: number, data: UpdateAppointmentDto, ip?: string) {
    const record = await this.findOne(id);
    const before = record.toJSON();
    if (data.deliveryDate) this.validateDeliveryDate(data.deliveryDate);
    if (data.orderId) await this.validateOrder(data.orderId);
    if (data.appointmentStatusId) await this.validateStatus(data.appointmentStatusId);
    await record.update(data);
    const result = await this.findOne(id);
    this.eventEmitter.emit('audit.appointment', new AuditEvent('Appointment', id, 'ATUALIZADO', before, result.toJSON(), ip));
    return result;
  }

  async remove(id: number, ip?: string) {
    const record = await this.findOne(id);
    const before = record.toJSON();
    await record.destroy();
    this.eventEmitter.emit('audit.appointment', new AuditEvent('Appointment', id, 'DELETADA', before, null, ip));
  }
}
