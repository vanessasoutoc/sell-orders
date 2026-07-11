import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { TransportType } from './transport-type.model';
import { paginate, PaginatedResult } from '../../common/pagination.dto';

@Injectable()
export class TransportTypesService {
  constructor(@InjectModel(TransportType) private readonly model: typeof TransportType) {}

  async findAll(page = 1, limit = 10): Promise<PaginatedResult<TransportType>> {
    const offset = (page - 1) * limit;
    const { rows, count } = await this.model.findAndCountAll({ limit, offset });
    return paginate(rows, count, page, limit);
  }

  async findOne(id: number) {
    const record = await this.model.findByPk(id);
    if (!record) throw new NotFoundException('Tipo de transporte não encontrado');
    return record;
  }

  create(data: Partial<TransportType>) {
    return this.model.create(data as any);
  }

  async update(id: number, data: Partial<TransportType>) {
    const record = await this.findOne(id);
    return record.update(data);
  }

  async remove(id: number) {
    const record = await this.findOne(id);
    await record.destroy();
  }
}
