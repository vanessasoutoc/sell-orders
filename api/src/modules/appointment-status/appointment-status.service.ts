import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AppointmentStatus } from './appointment-status.model';
import { paginate, PaginatedResult } from '../../common/pagination.dto';

@Injectable()
export class AppointmentStatusService {
  constructor(@InjectModel(AppointmentStatus) private readonly model: typeof AppointmentStatus) {}

  async findAll(page = 1, limit = 10): Promise<PaginatedResult<AppointmentStatus>> {
    const offset = (page - 1) * limit;
    const { rows, count } = await this.model.findAndCountAll({ limit, offset });
    return paginate(rows, count, page, limit);
  }

  async findOne(id: number) {
    const record = await this.model.findByPk(id);
    if (!record) throw new NotFoundException('Status de agendamento não encontrado');
    return record;
  }

  create(data: Partial<AppointmentStatus>) {
    return this.model.create(data as any);
  }

  async update(id: number, data: Partial<AppointmentStatus>) {
    const record = await this.findOne(id);
    return record.update(data);
  }

  async remove(id: number) {
    const record = await this.findOne(id);
    await record.destroy();
  }
}
