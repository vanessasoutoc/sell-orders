import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { getModelToken } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderItem } from '../modules/orders/order-item.model';
import { Order } from '../modules/orders/order.model';
import { OrdersService } from '../modules/orders/orders.service';
import { Customer } from '../modules/customers/customer.model';
import { TransportType } from '../modules/transport-types/transport-type.model';
import { OrderStatus } from '../modules/order-status/order-status.model';
import { Item } from '../modules/items/item.model';

const mockOrder = {
  id: 1,
  customerId: 1,
  transportTypeId: 1,
  orderStatusId: 1,
  orderStatus: { status: 'CRIADA' },
  toJSON: jest.fn().mockReturnValue({ id: 1, customerId: 1, transportTypeId: 1, orderStatusId: 1 }),
  update: jest.fn().mockResolvedValue({
    toJSON: jest.fn().mockReturnValue({ id: 1, customerId: 1, transportTypeId: 1, orderStatusId: 2 }),
  }),
  destroy: jest.fn().mockResolvedValue(undefined),
};

const mockEventEmitter = { emit: jest.fn() };

const mockOrderModel = {
  findAndCountAll: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
};

const mockCustomerModel = { findByPk: jest.fn() };
const mockTransportTypeModel = { findByPk: jest.fn() };
const mockOrderStatusModel = { findByPk: jest.fn() };
const mockItemModel = { findByPk: jest.fn() };

jest.mock('../modules/orders/order-item.model', () => ({
  OrderItem: {
    bulkCreate: jest.fn(),
    destroy: jest.fn(),
  },
}));

jest.mock('../modules/customers/customer-transport-type.model', () => ({
  CustomerTransportType: {
    findOne: jest.fn().mockResolvedValue({ id: 1 }),
  },
}));

describe('OrdersService', () => {
  let service: OrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getModelToken(Order), useValue: mockOrderModel },
        { provide: getModelToken(Customer), useValue: mockCustomerModel },
        { provide: getModelToken(TransportType), useValue: mockTransportTypeModel },
        { provide: getModelToken(OrderStatus), useValue: mockOrderStatusModel },
        { provide: getModelToken(Item), useValue: mockItemModel },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('deve retornar resultado paginado com valores padrão', async () => {
      mockOrderModel.findAndCountAll.mockResolvedValue({ rows: [mockOrder], count: 1 });
      const result = await service.findAll();
      expect(result).toEqual({ data: [mockOrder], total: 1, page: 1, limit: 10, totalPages: 1 });
      expect(mockOrderModel.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 10, offset: 0, distinct: true, where: {} }),
      );
    });

    it('deve retornar resultado paginado com page e limit customizados', async () => {
      mockOrderModel.findAndCountAll.mockResolvedValue({ rows: [mockOrder], count: 25 });
      const result = await service.findAll(2, 5);
      expect(result).toEqual({ data: [mockOrder], total: 25, page: 2, limit: 5, totalPages: 5 });
      expect(mockOrderModel.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 5, offset: 5, distinct: true }),
      );
    });

    it('deve filtrar por orderStatusId', async () => {
      mockOrderModel.findAndCountAll.mockResolvedValue({ rows: [mockOrder], count: 1 });
      await service.findAll(1, 10, { orderStatusId: 2 });
      expect(mockOrderModel.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({ where: { orderStatusId: 2 } }),
      );
    });

    it('deve filtrar por customerId', async () => {
      mockOrderModel.findAndCountAll.mockResolvedValue({ rows: [mockOrder], count: 1 });
      await service.findAll(1, 10, { customerId: 3 });
      expect(mockOrderModel.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({ where: { customerId: 3 } }),
      );
    });

    it('deve filtrar por transportTypeId', async () => {
      mockOrderModel.findAndCountAll.mockResolvedValue({ rows: [mockOrder], count: 1 });
      await service.findAll(1, 10, { transportTypeId: 1 });
      expect(mockOrderModel.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({ where: { transportTypeId: 1 } }),
      );
    });

    it('deve filtrar por data', async () => {
      mockOrderModel.findAndCountAll.mockResolvedValue({ rows: [mockOrder], count: 1 });
      await service.findAll(1, 10, { date: '2026-07-10' });
      const call = mockOrderModel.findAndCountAll.mock.calls[0][0];
      expect(call.where.createdAt).toBeDefined();
      expect(call.where.createdAt[Symbol.for('gte')]).toBeInstanceOf(Date);
      expect(call.where.createdAt[Symbol.for('lt')]).toBeInstanceOf(Date);
    });

    it('deve combinar múltiplos filtros', async () => {
      mockOrderModel.findAndCountAll.mockResolvedValue({ rows: [mockOrder], count: 1 });
      await service.findAll(1, 10, { customerId: 1, orderStatusId: 2 });
      expect(mockOrderModel.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({ where: { customerId: 1, orderStatusId: 2 } }),
      );
    });
  });

  describe('findOne', () => {
    it('deve retornar uma ordem pelo id', async () => {
      mockOrderModel.findByPk.mockResolvedValue(mockOrder);
      const result = await service.findOne(1);
      expect(result).toEqual(mockOrder);
    });

    it('deve lançar NotFoundException se ordem não existir', async () => {
      mockOrderModel.findByPk.mockResolvedValue(null);
      await expect(service.findOne(99)).rejects.toThrow(new NotFoundException('Ordem não encontrada'));
    });
  });

  describe('create', () => {
    const createDto = {
      customerId: 1,
      transportTypeId: 1,
      orderStatusId: 1,
      items: [{ itemId: 1, quantity: 2 }],
    };

    beforeEach(() => {
      mockCustomerModel.findByPk.mockResolvedValue({ id: 1 });
      mockTransportTypeModel.findByPk.mockResolvedValue({ id: 1 });
      mockOrderStatusModel.findByPk.mockResolvedValue({ id: 1 });
      mockItemModel.findByPk.mockResolvedValue({ id: 1 });
      mockOrderModel.create.mockResolvedValue({ id: 1 });
      mockOrderModel.findByPk.mockResolvedValue(mockOrder);
    });

    it('deve criar uma ordem com sucesso', async () => {
      const result = await service.create(createDto);
      expect(mockOrderModel.create).toHaveBeenCalledWith({ customerId: 1, transportTypeId: 1, orderStatusId: 1 });
      expect(OrderItem.bulkCreate).toHaveBeenCalledWith([{ orderId: 1, itemId: 1, quantity: 2 }]);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('audit.order', expect.any(Object));
      expect(result).toEqual(mockOrder);
    });

    it('deve lançar NotFoundException se customer não existir', async () => {
      mockCustomerModel.findByPk.mockResolvedValue(null);
      await expect(service.create(createDto)).rejects.toThrow(
        new NotFoundException('Cliente com id 1 não encontrado'),
      );
    });

    it('deve lançar NotFoundException se transportType não existir', async () => {
      mockTransportTypeModel.findByPk.mockResolvedValue(null);
      await expect(service.create(createDto)).rejects.toThrow(
        new NotFoundException('Tipo de transporte com id 1 não encontrado'),
      );
    });

    it('deve lançar NotFoundException se orderStatus não existir', async () => {
      mockOrderStatusModel.findByPk.mockResolvedValue(null);
      await expect(service.create(createDto)).rejects.toThrow(
        new NotFoundException('Status de ordem com id 1 não encontrado'),
      );
    });

    it('deve lançar NotFoundException se item não existir', async () => {
      mockItemModel.findByPk.mockResolvedValue(null);
      await expect(service.create(createDto)).rejects.toThrow(
        new NotFoundException('Item com id 1 não encontrado'),
      );
    });
  });

  describe('update', () => {
    const updateDto = { orderStatusId: 2, items: [{ itemId: 1, quantity: 3 }] };

    beforeEach(() => {
      mockOrderStatusModel.findByPk.mockResolvedValue({ id: 2, status: 'PLANEJADA' });
      mockItemModel.findByPk.mockResolvedValue({ id: 1 });
      mockOrderModel.findByPk.mockResolvedValue(mockOrder);
    });

    it('deve atualizar uma ordem com sucesso', async () => {
      const result = await service.update(1, updateDto);
      expect(mockOrder.update).toHaveBeenCalledWith({ orderStatusId: 2 });
      expect(OrderItem.destroy).toHaveBeenCalledWith({ where: { orderId: 1 } });
      expect(OrderItem.bulkCreate).toHaveBeenCalledWith([{ orderId: 1, itemId: 1, quantity: 3 }]);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('audit.order', expect.any(Object));
      expect(result).toEqual(mockOrder);
    });

    it('deve lançar NotFoundException se ordem não existir', async () => {
      mockOrderModel.findByPk.mockResolvedValue(null);
      await expect(service.update(99, updateDto)).rejects.toThrow(
        new NotFoundException('Ordem não encontrada'),
      );
    });

    it('deve lançar NotFoundException se orderStatus não existir no update', async () => {
      mockOrderStatusModel.findByPk.mockResolvedValue(null);
      await expect(service.update(1, updateDto)).rejects.toThrow(
        new NotFoundException('Status de ordem com id 2 não encontrado'),
      );
    });

    it('deve lançar BadRequestException para transição de status inválida', async () => {
      mockOrderStatusModel.findByPk.mockResolvedValue({ id: 3, status: 'ENTREGUE' });
      await expect(service.update(1, { orderStatusId: 3 })).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('deve remover uma ordem com sucesso', async () => {
      mockOrderModel.findByPk.mockResolvedValue(mockOrder);
      await service.remove(1);
      expect(OrderItem.destroy).toHaveBeenCalledWith({ where: { orderId: 1 } });
      expect(mockOrder.destroy).toHaveBeenCalledTimes(1);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('audit.order', expect.any(Object));
    });

    it('deve lançar NotFoundException se ordem não existir', async () => {
      mockOrderModel.findByPk.mockResolvedValue(null);
      await expect(service.remove(99)).rejects.toThrow(new NotFoundException('Ordem não encontrada'));
    });
  });

  describe('changeStatus', () => {
    beforeEach(() => {
      mockOrderModel.findByPk.mockResolvedValue(mockOrder);
      mockOrderStatusModel.findOne = jest.fn().mockResolvedValue({ id: 2 });
    });

    it('deve alterar o status da ordem com sucesso', async () => {
      await service.changeStatus(1, 'CONFIRMED');
      expect(mockOrderStatusModel.findOne).toHaveBeenCalledWith({ where: { status: 'CONFIRMED' } });
      expect(mockOrder.update).toHaveBeenCalledWith({ orderStatusId: 2 });
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('audit.order', expect.any(Object));
    });

    it('deve lançar NotFoundException se ordem não existir', async () => {
      mockOrderModel.findByPk.mockResolvedValue(null);
      await expect(service.changeStatus(99, 'CONFIRMED')).rejects.toThrow(new NotFoundException('Ordem não encontrada'));
    });

    it('deve lançar NotFoundException se status não existir', async () => {
      mockOrderStatusModel.findOne = jest.fn().mockResolvedValue(null);
      await expect(service.changeStatus(1, 'INVALID')).rejects.toThrow(
        new NotFoundException("OrderStatus 'INVALID' not found"),
      );
    });
  });
});
