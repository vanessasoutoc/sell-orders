import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { OrderStatus } from './order-status.model';
import { OrderStatusService } from './order-status.service';
import { OrderStatusController } from './order-status.controller';

const SEED_DATA = [
  { name: 'Criada', status: 'CRIADA' },
  { name: 'Planejada', status: 'PLANEJADA' },
  { name: 'Agendada', status: 'AGENDADA' },
  { name: 'Em Transporte', status: 'EM_TRANSPORTE' },
  { name: 'Entregue', status: 'ENTREGUE' },
];

@Module({
  imports: [SequelizeModule.forFeature([OrderStatus])],
  controllers: [OrderStatusController],
  providers: [OrderStatusService],
  exports: [OrderStatusService],
})
export class OrderStatusModule implements OnApplicationBootstrap {
  constructor(private readonly service: OrderStatusService) {}

  async onApplicationBootstrap() {
    const existing = await this.service.findAll();
    if (existing.total === 0) {
      await Promise.all(SEED_DATA.map((item) => this.service.create(item)));
    }
  }
}
