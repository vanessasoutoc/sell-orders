import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TransportType } from './transport-type.model';
import { TransportTypesService } from './transport-types.service';
import { TransportTypesController } from './transport-types.controller';

const SEED_DATA = [
  { name: 'Caminhão', type: 'CAMINHAO' },
  { name: 'Carreta', type: 'CARRETA' },
  { name: 'Bi-truck', type: 'BI_TRUCK' },
];

@Module({
  imports: [SequelizeModule.forFeature([TransportType])],
  controllers: [TransportTypesController],
  providers: [TransportTypesService],
  exports: [TransportTypesService],
})
export class TransportTypesModule implements OnApplicationBootstrap {
  constructor(private readonly service: TransportTypesService) {}

  async onApplicationBootstrap() {
    const existing = await this.service.findAll();
    if (existing.total === 0) {
      await Promise.all(SEED_DATA.map((item) => this.service.create(item)));
    }
  }
}
