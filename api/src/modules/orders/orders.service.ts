import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Op } from 'sequelize';
import { Order } from './order.model';
import { OrderItem } from './order-item.model';
import { Customer } from '../customers/customer.model';
import { CustomerTransportType } from '../customers/customer-transport-type.model';
import { TransportType } from '../transport-types/transport-type.model';
import { OrderStatus } from '../order-status/order-status.model';
import { Item } from '../items/item.model';
import { CreateOrderDto, FilterOrderDto, UpdateOrderDto } from './order.dto';
import { paginate, PaginatedResult } from '../../common/pagination.dto';
import { AuditEvent } from '../audit-logs/audit.event';

import { Appointment } from '../appointments/appointment.model';
import { AppointmentStatus } from '../appointment-status/appointment-status.model';

const INCLUDE_ALL = [
  { model: Customer },
  { model: TransportType },
  { model: OrderStatus },
  { model: Item, through: { attributes: ['quantity'] } },
  { model: Appointment, include: [{ model: AppointmentStatus }] },
];

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order) private readonly model: typeof Order,
    @InjectModel(Customer) private readonly customerModel: typeof Customer,
    @InjectModel(TransportType) private readonly transportTypeModel: typeof TransportType,
    @InjectModel(OrderStatus) private readonly orderStatusModel: typeof OrderStatus,
    @InjectModel(Item) private readonly itemModel: typeof Item,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private static readonly STATUS_FLOW: Record<string, string> = {
    CRIADA: 'PLANEJADA',
    PLANEJADA: 'AGENDADA',
    AGENDADA: 'EM_TRANSPORTE',
    EM_TRANSPORTE: 'ENTREGUE',
  };

  private validateTransition(current: string, next: string) {
    const allowed = OrdersService.STATUS_FLOW[current];
    if (!allowed || allowed !== next) {
      throw new BadRequestException(
        `Transição de status inválida: ${current} → ${next}. Sequência permitida: CRIADA → PLANEJADA → AGENDADA → EM_TRANSPORTE → ENTREGUE`,
      );
    }
  }

  async findAll(page = 1, limit = 10, filters: FilterOrderDto = {}): Promise<PaginatedResult<Order>> {
    const offset = (page - 1) * limit;
    const where: any = {};

    if (filters.orderStatusId) where.orderStatusId = filters.orderStatusId;
    if (filters.customerId) where.customerId = filters.customerId;
    if (filters.transportTypeId) where.transportTypeId = filters.transportTypeId;
    if (filters.date) {
      const start = new Date(filters.date);
      const end = new Date(filters.date);
      end.setDate(end.getDate() + 1);
      where.createdAt = { [Op.gte]: start, [Op.lt]: end };
    }

    const { rows, count } = await this.model.findAndCountAll({ where, include: INCLUDE_ALL, limit, offset, order: [['createdAt', filters.sortOrder === 'asc' ? 'ASC' : 'DESC']], distinct: true });
    return paginate(rows, count, page, limit);
  }

  async findOne(id: number) {
    const record = await this.model.findByPk(id, { include: INCLUDE_ALL });
    if (!record) throw new NotFoundException('Ordem não encontrada');
    return record;
  }

  private async validateForeignKeys(data: CreateOrderDto | UpdateOrderDto) {
    if (data.customerId) {
      const customer = await this.customerModel.findByPk(data.customerId);
      if (!customer) throw new NotFoundException(`Cliente com id ${data.customerId} não encontrado`);
    }
    if (data.transportTypeId) {
      const transportType = await this.transportTypeModel.findByPk(data.transportTypeId);
      if (!transportType) throw new NotFoundException(`Tipo de transporte com id ${data.transportTypeId} não encontrado`);
    }
    if (data.orderStatusId) {
      const orderStatus = await this.orderStatusModel.findByPk(data.orderStatusId);
      if (!orderStatus) throw new NotFoundException(`Status de ordem com id ${data.orderStatusId} não encontrado`);
    }
    if (data.items?.length) {
      for (const { itemId } of data.items) {
        const item = await this.itemModel.findByPk(itemId);
        if (!item) throw new NotFoundException(`Item com id ${itemId} não encontrado`);
      }
    }
  }

  async create(data: CreateOrderDto, ip?: string) {
    await this.validateForeignKeys(data);
    const authorized = await CustomerTransportType.findOne({
      where: { customerId: data.customerId, transportTypeId: data.transportTypeId, active: true },
    });
    if (!authorized) {
      throw new BadRequestException(
        `Tipo de transporte ${data.transportTypeId} não está ativo/autorizado para o cliente ${data.customerId}`,
      );
    }
    const { items, ...orderData } = data;
    const order = await this.model.create(orderData as any);
    if (items?.length) {
      await OrderItem.bulkCreate(
        items.map((i) => ({ orderId: order.id, itemId: i.itemId, quantity: i.quantity })),
      );
    }
    const result = await this.findOne(order.id);
    this.eventEmitter.emit('audit.order', new AuditEvent('Order', order.id, 'CRIADA', null, result.toJSON(), ip));
    return result;
  }

  async update(id: number, data: UpdateOrderDto, ip?: string) {
    await this.validateForeignKeys(data);
    const order = await this.findOne(id);
    if (data.orderStatusId && data.orderStatusId !== order.orderStatusId) {
      const newStatus = await this.orderStatusModel.findByPk(data.orderStatusId);
      if (!newStatus) throw new NotFoundException(`Status de ordem com id ${data.orderStatusId} não encontrado`);
      this.validateTransition(order.orderStatus.status, newStatus.status);
    }
    const before = order.toJSON();
    const { items, ...orderData } = data;
    await order.update(orderData);
    if (items) {
      await OrderItem.destroy({ where: { orderId: id } });
      await OrderItem.bulkCreate(
        items.map((i) => ({ orderId: id, itemId: i.itemId, quantity: i.quantity })),
      );
    }
    const result = await this.findOne(id);
    this.eventEmitter.emit('audit.order', new AuditEvent('Order', id, 'ATUALIZADO', before, result.toJSON(), ip));
    return result;
  }

  async changeStatus(orderId: number, statusValue: string, ip?: string) {
    const order = await this.findOne(orderId);
    const before = order.toJSON();
    const status = await this.orderStatusModel.findOne({ where: { status: statusValue } });
    if (!status) throw new NotFoundException(`OrderStatus '${statusValue}' not found`);
    const result = await order.update({ orderStatusId: status.id });
    this.eventEmitter.emit('audit.order', new AuditEvent('Order', orderId, 'STATUS_ALTERADO', before, result.toJSON(), ip));
    return result;
  }

  async remove(id: number, ip?: string) {
    const order = await this.findOne(id);
    const before = order.toJSON();
    await OrderItem.destroy({ where: { orderId: id } });
    await order.destroy();
    this.eventEmitter.emit('audit.order', new AuditEvent('Order', id, 'DELETADO', before, null, ip));
  }
}
