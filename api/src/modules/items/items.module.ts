import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Item } from './item.model';
import { ItemsService } from './items.service';
import { ItemsController } from './items.controller';

const SEED_DATA = [
  { name: 'Pneu R14', description: 'Pneu aro 14' },
  { name: 'Pneu R15', description: 'Pneu aro 15' },
  { name: 'Pneu R16', description: 'Pneu aro 16' },
  { name: 'Roda Liga Level Orbital VW R14', description: 'Roda liga leve orbital VW aro 14' },
  { name: 'Roda Liga Level Orbital VW R15', description: 'Roda liga leve orbital VW aro 15' },
  { name: 'Roda Liga Level Orbital VW R16', description: 'Roda liga leve orbital VW aro 16' },
];

@Module({
  imports: [SequelizeModule.forFeature([Item])],
  controllers: [ItemsController],
  providers: [ItemsService],
  exports: [ItemsService],
})
export class ItemsModule implements OnApplicationBootstrap {
  constructor(private readonly service: ItemsService) {}

  async onApplicationBootstrap() {
    const existing = await this.service.findAll();
    if (existing.total === 0) {
      await Promise.all(SEED_DATA.map((item) => this.service.create(item)));
    }
  }
}
