import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createWrapper } from '@/test/utils';
import * as ordersService from '@/modules/orders/ordersService';
import OrderForm from '@/modules/orders/OrderForm';

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
    disabled,
  }: {
    placeholder: string;
    onChange: (o: { id: number; name: string }) => void;
    value: { id: number; name: string } | null;
    disabled?: boolean;
  }) => (
    <input
      placeholder={placeholder}
      value={value?.name ?? ''}
      onChange={(e) => onChange({ id: 1, name: e.target.value })}
      data-testid={placeholder}
      disabled={disabled}
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

const mockOrder = {
  id: 5,
  customerId: 1,
  transportTypeId: 1,
  orderStatusId: 2,
  customer: { id: 1, name: 'João Silva' },
  transportType: { id: 1, name: 'Carreta', type: 'CARRETA' },
  orderStatus: { id: 2, name: 'Planejada', status: 'PLANEJADA' },
  items: [{ id: 1, name: 'Pneu R15', OrderItem: { quantity: 2 } }],
  createdAt: '2026-07-10T18:00:00.000Z',
};

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
  (ordersService.getAuthorizedTransportTypes as jest.Mock).mockResolvedValue(mockTransportTypes);
  (ordersService.getOrderStatuses as jest.Mock).mockResolvedValue(mockStatuses);
  (ordersService.createOrder as jest.Mock).mockResolvedValue(mockCreatedOrder);
  (ordersService.updateOrder as jest.Mock).mockResolvedValue(mockOrder);
});

const fillAndSubmit = async (user: ReturnType<typeof userEvent.setup>) => {
  await waitFor(() => expect(screen.getByText('Carreta')).toBeInTheDocument());
  await user.type(screen.getByPlaceholderText('Buscar cliente...'), 'João');
  const combos = screen.getAllByRole('combobox');
  await user.selectOptions(combos[0], '1');
  await user.selectOptions(combos[1], '1');
  await user.type(screen.getByPlaceholderText('Buscar item...'), 'Pneu');
  fireEvent.submit(screen.getByText('Salvar Ordem'));
};

describe('OrderForm — modo criação', () => {
  it('renderiza todos os campos', () => {
    render(<OrderForm />, { wrapper: createWrapper() });
    expect(screen.getByPlaceholderText('Buscar cliente...')).toBeInTheDocument();
    expect(screen.getByText('Tipo de Transporte')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Buscar item...')).toBeInTheDocument();
  });

  it('popula os selects de transporte e status', async () => {
    render(<OrderForm />, { wrapper: createWrapper() });
    await waitFor(() => expect(screen.getByText('Carreta')).toBeInTheDocument());
    expect(screen.getByText('Caminhão')).toBeInTheDocument();
    expect(screen.getByText('Criada')).toBeInTheDocument();
    expect(screen.getByText('Planejada')).toBeInTheDocument();
  });

  it('adiciona nova linha de item ao clicar em + Adicionar item', () => {
    render(<OrderForm />, { wrapper: createWrapper() });
    expect(screen.getAllByPlaceholderText('Buscar item...')).toHaveLength(1);
    fireEvent.click(screen.getByText('+ Adicionar item'));
    expect(screen.getAllByPlaceholderText('Buscar item...')).toHaveLength(2);
  });

  it('remove linha de item ao clicar em ✕', () => {
    render(<OrderForm />, { wrapper: createWrapper() });
    fireEvent.click(screen.getByText('+ Adicionar item'));
    expect(screen.getAllByPlaceholderText('Buscar item...')).toHaveLength(2);
    fireEvent.click(screen.getAllByText('✕')[0]);
    expect(screen.getAllByPlaceholderText('Buscar item...')).toHaveLength(1);
  });

  it('botão remover fica desabilitado quando há apenas uma linha', () => {
    render(<OrderForm />, { wrapper: createWrapper() });
    expect(screen.getByText('✕')).toBeDisabled();
  });

  it('navega para /orders ao clicar em Cancelar', () => {
    render(<OrderForm />, { wrapper: createWrapper() });
    fireEvent.click(screen.getByText('Cancelar'));
    expect(mockPush).toHaveBeenCalledWith('/orders');
  });

  it('chama createOrder com os dados corretos ao submeter', async () => {
    const user = userEvent.setup();
    render(<OrderForm />, { wrapper: createWrapper() });
    await fillAndSubmit(user);
    await waitFor(() => {
      expect(ordersService.createOrder).toHaveBeenCalledWith(
        expect.objectContaining({ customerId: 1, transportTypeId: 1, orderStatusId: 1 }),
      );
    });
  });

  it('exibe mensagem de erro quando createOrder falha', async () => {
    (ordersService.createOrder as jest.Mock).mockRejectedValue(new Error('Erro'));
    const user = userEvent.setup();
    render(<OrderForm />, { wrapper: createWrapper() });
    await fillAndSubmit(user);
    await waitFor(() =>
      expect(screen.getByText('Erro ao salvar ordem. Tente novamente.')).toBeInTheDocument(),
    );
  });

  it('redireciona para /orders após criar com sucesso', async () => {
    const user = userEvent.setup();
    render(<OrderForm />, { wrapper: createWrapper() });
    await fillAndSubmit(user);
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/orders'));
  });
});

describe('OrderForm — modo visualização', () => {
  it('renderiza campos desabilitados com dados da ordem', async () => {
    render(<OrderForm order={mockOrder} />, { wrapper: createWrapper() });
    await waitFor(() => expect(screen.getByDisplayValue('João Silva')).toBeInTheDocument());
    expect(screen.getByDisplayValue('João Silva')).toBeDisabled();
    expect(screen.getByText('Botão Editar')).toBeDefined();
  });

  it('exibe botão Editar no header', () => {
    render(<OrderForm order={mockOrder} />, { wrapper: createWrapper() });
    expect(screen.getByText('Editar')).toBeInTheDocument();
  });

  it('não exibe botão Salvar Ordem no modo visualização', () => {
    render(<OrderForm order={mockOrder} />, { wrapper: createWrapper() });
    expect(screen.queryByText('Salvar Ordem')).not.toBeInTheDocument();
  });

  it('habilita campos e exibe Salvar Ordem ao clicar em Editar', async () => {
    render(<OrderForm order={mockOrder} />, { wrapper: createWrapper() });
    fireEvent.click(screen.getByText('Editar'));
    await waitFor(() => expect(screen.getByText('Salvar Ordem')).toBeInTheDocument());
    expect(screen.queryByText('Editar')).not.toBeInTheDocument();
  });

  it('chama updateOrder ao salvar no modo edição', async () => {
    const user = userEvent.setup();
    render(<OrderForm order={mockOrder} initialEditing />, { wrapper: createWrapper() });
    await waitFor(() => expect(screen.getByText('Salvar Ordem')).toBeInTheDocument());
    fireEvent.submit(screen.getByText('Salvar Ordem'));
    await waitFor(() => expect(ordersService.updateOrder).toHaveBeenCalledWith(mockOrder.id, expect.any(Object)));
  });
});
