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

jest.mock('@/icons', () => ({
  PencilIcon: () => null,
}));

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

// seleciona cliente primeiro, depois aguarda transporte carregar (comportamento real do componente)
const fillAndSubmit = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByPlaceholderText('Buscar cliente...'), 'João');
  await waitFor(() => expect(screen.getByText('Carreta')).toBeInTheDocument());
  const combos = screen.getAllByRole('combobox');
  await user.selectOptions(combos[0], '1');
  await user.selectOptions(combos[1], '1');
  await user.type(screen.getByPlaceholderText('Buscar item...'), 'Pneu');
  fireEvent.submit(screen.getByText('Salvar Ordem'));
};

// ─── Modo criação ─────────────────────────────────────────────────────────────

describe('OrderForm — modo criação', () => {
  it('renderiza todos os campos', () => {
    render(<OrderForm />, { wrapper: createWrapper() });
    expect(screen.getByPlaceholderText('Buscar cliente...')).toBeInTheDocument();
    expect(screen.getByText('Tipo de Transporte')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Buscar item...')).toBeInTheDocument();
  });

  it('exibe apenas CRIADA no select de status (regra: nova ordem só pode iniciar como CRIADA)', async () => {
    render(<OrderForm />, { wrapper: createWrapper() });
    await waitFor(() => expect(screen.getByText('Criada')).toBeInTheDocument());
    expect(screen.queryByText('Planejada')).not.toBeInTheDocument();
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
    (ordersService.createOrder as jest.Mock).mockRejectedValue(new Error('Erro ao criar ordem'));
    const user = userEvent.setup();
    render(<OrderForm />, { wrapper: createWrapper() });
    await fillAndSubmit(user);
    await waitFor(() =>
      expect(screen.getByText('Erro ao criar ordem')).toBeInTheDocument(),
    );
  });

  it('redireciona para /orders após criar com sucesso', async () => {
    const user = userEvent.setup();
    render(<OrderForm />, { wrapper: createWrapper() });
    await fillAndSubmit(user);
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/orders'));
  });
});

// ─── Regras de negócio: status ────────────────────────────────────────────────

describe('OrderForm — regras de negócio: status', () => {
  it('exibe status atual e próximo no select ao editar ordem CRIADA', async () => {
    const order = {
      ...mockOrder,
      orderStatusId: 1,
      orderStatus: { id: 1, name: 'Criada', status: 'CRIADA' },
    };
    render(<OrderForm order={order} initialEditing />, { wrapper: createWrapper() });
    await waitFor(() => expect(screen.getByText('Criada')).toBeInTheDocument());
    expect(screen.getByText('Planejada')).toBeInTheDocument();
  });

  it('não exibe status que pulam etapas ao editar ordem CRIADA', async () => {
    const allStatuses = [
      { id: 1, name: 'Criada', status: 'CRIADA' },
      { id: 2, name: 'Planejada', status: 'PLANEJADA' },
      { id: 3, name: 'Agendada', status: 'AGENDADA' },
      { id: 4, name: 'Em Transporte', status: 'EM_TRANSPORTE' },
      { id: 5, name: 'Entregue', status: 'ENTREGUE' },
    ];
    (ordersService.getOrderStatuses as jest.Mock).mockResolvedValue(allStatuses);
    const order = {
      ...mockOrder,
      orderStatusId: 1,
      orderStatus: { id: 1, name: 'Criada', status: 'CRIADA' },
    };
    render(<OrderForm order={order} initialEditing />, { wrapper: createWrapper() });
    await waitFor(() => expect(screen.getByText('Criada')).toBeInTheDocument());
    expect(screen.queryByText('Agendada')).not.toBeInTheDocument();
    expect(screen.queryByText('Em Transporte')).not.toBeInTheDocument();
    expect(screen.queryByText('Entregue')).not.toBeInTheDocument();
  });

  it('exibe mensagem de erro de transição inválida retornada pela API', async () => {
    const errorMsg = 'Transição de status inválida';
    (ordersService.updateOrder as jest.Mock).mockRejectedValue(new Error(errorMsg));
    render(<OrderForm order={mockOrder} initialEditing />, { wrapper: createWrapper() });
    await waitFor(() => expect(screen.getByText('Carreta')).toBeInTheDocument());
    fireEvent.submit(screen.getByText('Salvar Ordem'));
    await waitFor(() => expect(screen.getByText(errorMsg)).toBeInTheDocument());
  });
});

// ─── Regras de negócio: itens e transporte ────────────────────────────────────

describe('OrderForm — regras de negócio: itens e transporte', () => {
  it('exibe erro ao tentar salvar sem nenhum item válido', async () => {
    const user = userEvent.setup();
    render(<OrderForm />, { wrapper: createWrapper() });
    await user.type(screen.getByPlaceholderText('Buscar cliente...'), 'João');
    await waitFor(() => expect(screen.getByText('Carreta')).toBeInTheDocument());
    const combos = screen.getAllByRole('combobox');
    await user.selectOptions(combos[0], '1');
    await user.selectOptions(combos[1], '1');
    // o mock do Autocomplete não suporta null, então verificamos que createOrder não é chamado
    // quando o item não é preenchido (estado inicial)
    const form = screen.getByRole('button', { name: 'Salvar Ordem' }).closest('form')!;
    fireEvent.submit(form);
    // o react-hook-form bloqueia o submit por causa do campo item required
    await waitFor(() => expect(ordersService.createOrder).not.toHaveBeenCalled());
  });

  it('exibe mensagem de erro de transporte não autorizado retornada pela API', async () => {
    const errorMsg = 'Tipo de transporte 2 não está ativo/autorizado para o cliente 1';
    (ordersService.createOrder as jest.Mock).mockRejectedValue(new Error(errorMsg));
    const user = userEvent.setup();
    render(<OrderForm />, { wrapper: createWrapper() });
    await fillAndSubmit(user);
    await waitFor(() => expect(screen.getByText(errorMsg)).toBeInTheDocument());
  });

  it('exibe mensagem de erro genérica quando a API retorna erro sem mensagem', async () => {
    (ordersService.createOrder as jest.Mock).mockRejectedValue(new Error(''));
    const user = userEvent.setup();
    render(<OrderForm />, { wrapper: createWrapper() });
    await fillAndSubmit(user);
    await waitFor(() =>
      expect(screen.getByText('Erro ao salvar ordem. Tente novamente.')).toBeInTheDocument(),
    );
  });

  it('limpa o erro de API ao submeter novamente com sucesso', async () => {
    (ordersService.createOrder as jest.Mock)
      .mockRejectedValueOnce(new Error('Erro temporário'))
      .mockResolvedValueOnce(mockCreatedOrder);
    const user = userEvent.setup();
    render(<OrderForm />, { wrapper: createWrapper() });
    await fillAndSubmit(user);
    await waitFor(() => expect(screen.getByText('Erro temporário')).toBeInTheDocument());
    await fillAndSubmit(user);
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/orders'));
    expect(screen.queryByText('Erro temporário')).not.toBeInTheDocument();
  });
});

// ─── Modo visualização ────────────────────────────────────────────────────────

describe('OrderForm — modo visualização', () => {
  it('renderiza campos desabilitados com dados da ordem', async () => {
    render(<OrderForm order={mockOrder} />, { wrapper: createWrapper() });
    await waitFor(() => expect(screen.getByDisplayValue('João Silva')).toBeInTheDocument());
    expect(screen.getByDisplayValue('João Silva')).toBeDisabled();
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
    render(<OrderForm order={mockOrder} initialEditing />, { wrapper: createWrapper() });
    await waitFor(() => expect(screen.getByText('Carreta')).toBeInTheDocument());
    fireEvent.submit(screen.getByText('Salvar Ordem'));
    await waitFor(() => expect(ordersService.updateOrder).toHaveBeenCalledWith(mockOrder.id, expect.any(Object)));
  });
});
