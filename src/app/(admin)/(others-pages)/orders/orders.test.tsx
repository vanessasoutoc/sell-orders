import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { createWrapper } from '@/test/utils';
import * as ordersService from '@/modules/orders/ordersService';
import Orders from '@/app/(admin)/(others-pages)/orders/page';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('@/modules/orders/ordersService');

const mockOrdersResponse = {
  data: [
    {
      id: 1,
      customerId: 1,
      customer: { id: 1, name: 'João Silva' },
      transportTypeId: 1,
      transportType: { id: 1, name: 'Carreta', type: 'CARRETA' },
      orderStatusId: 1,
      orderStatus: { id: 1, name: 'Criada', status: 'CRIADA' },
      items: [{ id: 1, name: 'Pneu R15', OrderItem: { quantity: 2 } }],
      createdAt: '2026-07-10T18:00:00.000Z',
    },
  ],
  total: 1,
  page: 1,
  limit: 10,
  totalPages: 1,
};

const mockStatuses = [{ id: 1, name: 'Criada', status: 'CRIADA' }];
const mockCustomers = [{ id: 1, name: 'João Silva' }];
const mockTransportTypes = [{ id: 1, name: 'Carreta', type: 'CARRETA' }];

beforeEach(() => {
  jest.clearAllMocks();
  (ordersService.getOrders as jest.Mock).mockResolvedValue(mockOrdersResponse);
  (ordersService.getOrderStatuses as jest.Mock).mockResolvedValue(mockStatuses);
  (ordersService.getCustomers as jest.Mock).mockResolvedValue({ data: mockCustomers, totalPages: 1 });
  (ordersService.getTransportTypes as jest.Mock).mockResolvedValue(mockTransportTypes);
});

describe('Orders page', () => {
  it('exibe estado de carregando inicialmente', () => {
    render(<Orders />, { wrapper: createWrapper() });
    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });

  it('exibe a lista de ordens após carregar', async () => {
    render(<Orders />, { wrapper: createWrapper() });
    await waitFor(() => expect(screen.getByText('João Silva')).toBeInTheDocument());
    expect(screen.getAllByText('Carreta').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Criada').length).toBeGreaterThan(0);
    expect(screen.getByText('#1')).toBeInTheDocument();
  });

  it('exibe mensagem quando não há ordens', async () => {
    (ordersService.getOrders as jest.Mock).mockResolvedValue({ ...mockOrdersResponse, data: [], total: 0 });
    render(<Orders />, { wrapper: createWrapper() });
    await waitFor(() => expect(screen.getByText('Nenhuma ordem encontrada.')).toBeInTheDocument());
  });

  it('exibe mensagem de erro quando a requisição falha', async () => {
    (ordersService.getOrders as jest.Mock).mockRejectedValue(new Error('Erro'));
    render(<Orders />, { wrapper: createWrapper() });
    await waitFor(() => expect(screen.getByText('Erro ao carregar ordens.')).toBeInTheDocument());
  });

  it('navega para /orders/new ao clicar em Nova Ordem', async () => {
    render(<Orders />, { wrapper: createWrapper() });
    fireEvent.click(screen.getByText('+ Nova Ordem'));
    expect(mockPush).toHaveBeenCalledWith('/orders/new');
  });

  it('chama getOrders com filtros ao alterar o select de status', async () => {
    render(<Orders />, { wrapper: createWrapper() });
    await waitFor(() => expect(screen.getByText('Criada')).toBeInTheDocument());

    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[1], { target: { value: '1' } });

    await waitFor(() =>
      expect(ordersService.getOrders).toHaveBeenCalledWith(1, 10, expect.objectContaining({ orderStatusId: 1 }))
    );
  });
});
