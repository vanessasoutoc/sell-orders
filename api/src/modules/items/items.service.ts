import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Item } from './item.model';
import { paginate, PaginatedResult } from '../../common/pagination.dto';

@Injectable()
export class ItemsService {
  constructor(@InjectModel(Item) private readonly model: typeof Item) {}

  async findAll(page = 1, limit = 10): Promise<PaginatedResult<Item>> {
    const offset = (page - 1) * limit;
    const { rows, count } = await this.model.findAndCountAll({ limit, offset });
    return paginate(rows, count, page, limit);
  }

  async autocomplete(search = '', page = 1, limit = 10): Promise<PaginatedResult<Pick<Item, 'id' | 'name'>>> {
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

  async findOne(id: number) {
    const record = await this.model.findByPk(id);
    if (!record) throw new NotFoundException('Item não encontrado');
    return record;
  }

  create(data: Partial<Item>) {
    return this.model.create(data as any);
  }

  async update(id: number, data: Partial<Item>) {
    const record = await this.findOne(id);
    return record.update(data);
  }

  async remove(id: number) {
    const record = await this.findOne(id);
    await record.destroy();
  }
}
