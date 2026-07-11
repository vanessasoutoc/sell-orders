import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Customer } from './customer.model';
import { CustomerTransportType } from './customer-transport-type.model';
import { TransportType } from '../transport-types/transport-type.model';
import { CreateCustomerDto, UpdateCustomerDto } from './customer.dto';
import { paginate, PaginatedResult } from '../../common/pagination.dto';
import { AuditEvent } from '../audit-logs/audit.event';

const INCLUDE_TRANSPORT_TYPES = [
  {
    model: TransportType,
    through: { attributes: ['active'] },
  },
];

@Injectable()
export class CustomersService {
  constructor(
    @InjectModel(Customer) private readonly model: typeof Customer,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findAll(page = 1, limit = 10): Promise<PaginatedResult<Customer>> {
    const offset = (page - 1) * limit;
    const { rows, count } = await this.model.findAndCountAll({
      include: INCLUDE_TRANSPORT_TYPES,
      limit,
      offset,
      distinct: true,
    });
    return paginate(rows, count, page, limit);
  }

  async autocomplete(search = '', page = 1, limit = 10): Promise<PaginatedResult<Pick<Customer, 'id' | 'name'>>> {
    const offset = (page - 1) * limit;
    const where = search ? { name: { [Op.like]: `%${search}%` } } : {};
    const { rows, count } = await this.model.findAndCountAll({
      where,
      attributes: ['id', 'name'],
      limit,
      offset,
      order: [['name', 'ASC']],
    });
    return paginate(rows, count, page, limit);
  }

  async findOne(id: number): Promise<Customer> {
    const customer = await this.model.findByPk(id, { include: INCLUDE_TRANSPORT_TYPES });
    if (!customer) throw new NotFoundException('Cliente não encontrado');
    return customer;
  }

  async getTransportTypes(id: number): Promise<TransportType[]> {
    const customer = await this.findOne(id);
    return customer.transportTypes ?? [];
  }

  async getActiveTransportTypes(id: number): Promise<TransportType[]> {
    const customer = await this.model.findByPk(id, {
      include: [{
        model: TransportType,
        through: { attributes: ['active'], where: { active: true } },
      }],
    });
    if (!customer) throw new NotFoundException('Cliente não encontrado');
    return customer.transportTypes ?? [];
  }

  private async syncTransportTypes(customerId: number, transportTypes: { transportTypeId: number; active: boolean }[]) {
    await CustomerTransportType.destroy({ where: { customerId } });
    if (transportTypes.length) {
      await CustomerTransportType.bulkCreate(
        transportTypes.map(({ transportTypeId, active }) => ({ customerId, transportTypeId, active })),
      );
    }
  }

  async create(data: CreateCustomerDto, ip?: string): Promise<Customer> {
    const { transportTypes, ...customerData } = data;
    const customer = await this.model.create(customerData as any);
    if (transportTypes?.length) {
      await this.syncTransportTypes(customer.id, transportTypes);
    }
    const result = await this.findOne(customer.id);
    this.eventEmitter.emit('audit.customer', new AuditEvent('Customer', customer.id, 'CREATE', null, result.toJSON(), ip));
    return result;
  }

  async update(id: number, data: UpdateCustomerDto, ip?: string): Promise<Customer> {
    const customer = await this.findOne(id);
    const before = customer.toJSON();
    const { transportTypes, ...customerData } = data;
    await customer.update(customerData);
    if (transportTypes !== undefined) {
      await this.syncTransportTypes(id, transportTypes);
    }
    const result = await this.findOne(id);
    this.eventEmitter.emit('audit.customer', new AuditEvent('Customer', id, 'UPDATE', before, result.toJSON(), ip));
    return result;
  }

  async remove(id: number, ip?: string): Promise<void> {
    const customer = await this.findOne(id);
    const before = customer.toJSON();
    await CustomerTransportType.destroy({ where: { customerId: id } });
    await customer.destroy();
    this.eventEmitter.emit('audit.customer', new AuditEvent('Customer', id, 'DELETE', before, null, ip));
  }
}
