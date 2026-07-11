import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from '../modules/orders/orders.controller';
import { OrdersService } from '../modules/orders/orders.service';

const mockOrder = { id: 1, customerId: 1, transportTypeId: 1, orderStatusId: 1, items: [] };

const mockPaginated = { data: [mockOrder], total: 1, page: 1, limit: 10, totalPages: 1 };

const mockService = {
  findAll: jest.fn().mockResolvedValue(mockPaginated),
  findOne: jest.fn().mockResolvedValue(mockOrder),
  create: jest.fn().mockResolvedValue(mockOrder),
  update: jest.fn().mockResolvedValue(mockOrder),
  remove: jest.fn().mockResolvedValue(undefined),
};

describe('OrdersController', () => {
  let controller: OrdersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [{ provide: OrdersService, useValue: mockService }],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
    jest.clearAllMocks();
  });

  it('findAll deve retornar resultado paginado com valores padrão', async () => {
    mockService.findAll.mockResolvedValue(mockPaginated);
    const result = await controller.findAll({ page: 1, limit: 10 }, {});
    expect(result).toEqual(mockPaginated);
    expect(mockService.findAll).toHaveBeenCalledWith(1, 10, {});
  });

  it('findAll deve repassar page e limit customizados ao service', async () => {
    const customPaginated = { ...mockPaginated, page: 2, limit: 5 };
    mockService.findAll.mockResolvedValue(customPaginated);
    const result = await controller.findAll({ page: 2, limit: 5 }, {});
    expect(result).toEqual(customPaginated);
    expect(mockService.findAll).toHaveBeenCalledWith(2, 5, {});
  });

  it('findAll deve repassar filtros ao service', async () => {
    mockService.findAll.mockResolvedValue(mockPaginated);
    const filters = { customerId: 1, orderStatusId: 2, transportTypeId: 1, date: '2026-07-10' };
    await controller.findAll({ page: 1, limit: 10 }, filters);
    expect(mockService.findAll).toHaveBeenCalledWith(1, 10, filters);
  });

  it('findOne deve retornar uma ordem pelo id', async () => {
    mockService.findOne.mockResolvedValue(mockOrder);
    const result = await controller.findOne(1);
    expect(result).toEqual(mockOrder);
    expect(mockService.findOne).toHaveBeenCalledWith(1);
  });

  it('create deve criar e retornar uma ordem', async () => {
    const dto = { customerId: 1, transportTypeId: 1, orderStatusId: 1, items: [{ itemId: 1, quantity: 2 }] };
    const req = { ip: '127.0.0.1' } as any;
    mockService.create.mockResolvedValue(mockOrder);
    const result = await controller.create(dto, req);
    expect(result).toEqual(mockOrder);
    expect(mockService.create).toHaveBeenCalledWith(dto, req.ip);
  });

  it('update deve atualizar e retornar a ordem', async () => {
    const dto = { orderStatusId: 2 };
    const req = { ip: '127.0.0.1' } as any;
    mockService.update.mockResolvedValue({ ...mockOrder, orderStatusId: 2 });
    const result = await controller.update(1, dto, req);
    expect(result).toEqual({ ...mockOrder, orderStatusId: 2 });
    expect(mockService.update).toHaveBeenCalledWith(1, dto, req.ip);
  });

  it('remove deve chamar o service com o id correto', async () => {
    const req = { ip: '127.0.0.1' } as any;
    await controller.remove(1, req);
    expect(mockService.remove).toHaveBeenCalledWith(1, req.ip);
  });
});
