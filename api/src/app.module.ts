import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize/dist/sequelize.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CustomersModule } from './modules/customers/customers.module';
import { OrderStatusModule } from './modules/order-status/order-status.module';
import { TransportTypesModule } from './modules/transport-types/transport-types.module';
import { ItemsModule } from './modules/items/items.module';
import { OrdersModule } from './modules/orders/orders.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { AppointmentStatusModule } from './modules/appointment-status/appointment-status.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { SummaryModule } from './modules/summary/summary.module';

@Module({
  imports: [
    EventEmitterModule.forRoot({ wildcard: true }),
    CustomersModule,
    OrderStatusModule,
    TransportTypesModule,
    ItemsModule,
    OrdersModule,
    AppointmentsModule,
    AppointmentStatusModule,
    AuditLogsModule,
    SummaryModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SequelizeModule.forRoot({
      dialect: 'mysql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,

      autoLoadModels: true,
      synchronize: true,

      logging: console.log,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
