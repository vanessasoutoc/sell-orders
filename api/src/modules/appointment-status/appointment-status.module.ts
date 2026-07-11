import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AppointmentStatus } from './appointment-status.model';
import { AppointmentStatusService } from './appointment-status.service';
import { AppointmentStatusController } from './appointment-status.controller';

const SEED_DATA = [
  { name: 'Pendente', status: 'PENDENTE' },
  { name: 'Confirmado', status: 'CONFIRMADO' },
  { name: 'Reagendado', status: 'REAGENDADO' },
];

@Module({
  imports: [SequelizeModule.forFeature([AppointmentStatus])],
  controllers: [AppointmentStatusController],
  providers: [AppointmentStatusService],
  exports: [AppointmentStatusService],
})
export class AppointmentStatusModule implements OnApplicationBootstrap {
  constructor(private readonly service: AppointmentStatusService) {}

  async onApplicationBootstrap() {
    const existing = await this.service.findAll();
    if (existing.total === 0) {
      await Promise.all(SEED_DATA.map((item) => this.service.create(item)));
    }
  }
}
