import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { OrderStatus } from './order-status.model';
import { paginate, PaginatedResult } from '../../common/pagination.dto';

@Injectable()
export class OrderStatusService {
  constructor(@InjectModel(OrderStatus) private readonly model: typeof OrderStatus) {}

  async findAll(page = 1, limit = 10): Promise<PaginatedResult<OrderStatus>> {
    const offset = (page - 1) * limit;
    const { rows, count } = await this.model.findAndCountAll({ limit, offset });
    return paginate(rows, count, page, limit);
  }

  async findOne(id: number) {
    const record = await this.model.findByPk(id);
    if (!record) throw new NotFoundException('Status de ordem não encontrado');
    return record;
  }

  create(data: Partial<OrderStatus>) {
    return this.model.create(data as any);
  }

  async update(id: number, data: Partial<OrderStatus>) {
    const record = await this.findOne(id);
    return record.update(data);
  }

  async remove(id: number) {
    const record = await this.findOne(id);
    await record.destroy();
  }
}
