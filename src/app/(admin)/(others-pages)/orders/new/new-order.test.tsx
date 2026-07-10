import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createWrapper } from '@/test/utils';
import * as ordersService from '@/modules/orders/ordersService';
import NewOrder from '@/app/(admin)/(others-pages)/orders/new/page';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/modules/orders/ordersService');

jest.mock('@/components/ui/autocomplete/Autocomplete', () => ({
  __esModule: true,
  default: ({
    placeholder,
    onChange,
    value,
  }: {
    placeholder: string;
    onChange: (o: { id: number; name: string }) => void;
    value: { id: number; name: string } | null;
  }) => (
    <input
      placeholder={placeholder}
      value={value?.name ?? ''}
      onChange={(e) => onChange({ id: 1, name: e.target.value })}
      data-testid={placeholder}
    />
  ),
}));

const mockTransportTypes = [
  { id: 1, name: 'Carreta', type: 'CARRETA' },
  { id: 2, name: 'Caminhão', type: 'CAMINHAO' },
];

const mockStatuses = [
  { id: 1, name: 'Criada', status: 'CRIADA' },
  { id: 2, name: 'Planejada', status: 'PLANEJADA' },
];

const mockCreatedOrder = {
  id: 10,
  customerId: 1,
  transportTypeId: 1,
  orderStatusId: 1,
  items: [],
  customer: { id: 1, name: 'João Silva' },
  transportType: { id: 1, name: 'Carreta', type: 'CARRETA' },
  orderStatus: { id: 1, name: 'Criada', status: 'CRIADA' },
  createdAt: '2026-07-10T18:00:00.000Z',
};

beforeEach(() => {
  jest.clearAllMocks();
  (ordersService.getTransportTypes as jest.Mock).mockResolvedValue(mockTransportTypes);
  (ordersService.getOrderStatuses as jest.Mock).mockResolvedValue(mockStatuses);
  (ordersService.createOrder as jest.Mock).mockResolvedValue(mockCreatedOrder);
});

const submitForm = async (user: ReturnType<typeof userEvent.setup>) => {
  await waitFor(() => expect(screen.getByText('Carreta')).toBeInTheDocument());
  await user.type(screen.getByPlaceholderText('Buscar cliente...'), 'João');
  await user.selectOptions(screen.getAllByRole('combobox')[0], '1');
  await user.selectOptions(screen.getAllByRole('combobox')[1], '1');
  await user.type(screen.getByPlaceholderText('Buscar item...'), 'Pneu');
  fireEvent.submit(screen.getByText('Salvar Ordem'));
};

describe('NewOrder page', () => {
  it('renderiza o formulário com todos os campos', () => {
    render(<NewOrder />, { wrapper: createWrapper() });
    expect(screen.getAllByText('Nova Ordem').length).toBeGreaterThan(0);
    expect(screen.getByPlaceholderText('Buscar cliente...')).toBeInTheDocument();
    expect(screen.getByText('Tipo de Transporte')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Buscar item...')).toBeInTheDocument();
  });

  it('popula os selects de transporte e status', async () => {
    render(<NewOrder />, { wrapper: createWrapper() });
    await waitFor(() => expect(screen.getByText('Carreta')).toBeInTheDocument());
    expect(screen.getByText('Caminhão')).toBeInTheDocument();
    expect(screen.getByText('Criada')).toBeInTheDocument();
    expect(screen.getByText('Planejada')).toBeInTheDocument();
  });

  it('adiciona uma nova linha de item ao clicar em + Adicionar item', () => {
    render(<NewOrder />, { wrapper: createWrapper() });
    expect(screen.getAllByPlaceholderText('Buscar item...')).toHaveLength(1);
    fireEvent.click(screen.getByText('+ Adicionar item'));
    expect(screen.getAllByPlaceholderText('Buscar item...')).toHaveLength(2);
  });

  it('remove uma linha de item ao clicar em ✕', () => {
    render(<NewOrder />, { wrapper: createWrapper() });
    fireEvent.click(screen.getByText('+ Adicionar item'));
    expect(screen.getAllByPlaceholderText('Buscar item...')).toHaveLength(2);
    fireEvent.click(screen.getAllByText('✕')[0]);
    expect(screen.getAllByPlaceholderText('Buscar item...')).toHaveLength(1);
  });

  it('botão remover fica desabilitado quando há apenas uma linha de item', () => {
    render(<NewOrder />, { wrapper: createWrapper() });
    expect(screen.getByText('✕')).toBeDisabled();
  });

  it('navega para /orders ao clicar em Cancelar', () => {
    render(<NewOrder />, { wrapper: createWrapper() });
    fireEvent.click(screen.getByText('Cancelar'));
    expect(mockPush).toHaveBeenCalledWith('/orders');
  });

  it('chama createOrder com os dados corretos ao submeter', async () => {
    const user = userEvent.setup();
    render(<NewOrder />, { wrapper: createWrapper() });
    await submitForm(user);
    await waitFor(() => {
      const calls = (ordersService.createOrder as jest.Mock).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      expect(calls[0][0]).toMatchObject({ customerId: 1, transportTypeId: 1, orderStatusId: 1 });
    });
  });

  it('exibe mensagem de erro quando createOrder falha', async () => {
    (ordersService.createOrder as jest.Mock).mockRejectedValue(new Error('Erro'));
    const user = userEvent.setup();
    render(<NewOrder />, { wrapper: createWrapper() });
    await submitForm(user);
    await waitFor(() =>
      expect(screen.getByText('Erro ao criar ordem. Tente novamente.')).toBeInTheDocument()
    );
  });

  it('redireciona para /orders após criar com sucesso', async () => {
    const user = userEvent.setup();
    render(<NewOrder />, { wrapper: createWrapper() });
    await submitForm(user);
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/orders'));
  });
});
