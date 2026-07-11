import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Customer } from './customer.model';
import { CustomerTransportType } from './customer-transport-type.model';
import { TransportType } from '../transport-types/transport-type.model';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';

@Module({
  imports: [SequelizeModule.forFeature([Customer, CustomerTransportType, TransportType])],
  controllers: [CustomersController],
  providers: [CustomersService],
  exports: [CustomersService],
})
export class CustomersModule {}
