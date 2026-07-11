import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createWrapper } from '@/test/utils';
import * as ordersService from '@/modules/orders/ordersService';
import * as appointmentsService from '@/modules/appointments/appointmentsService';
import Orders from '@/app/(admin)/(others-pages)/orders/page';

const mockPush = jest.fn();
let mockSearchParams = new URLSearchParams();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => mockSearchParams,
}));

jest.mock('@/modules/orders/ordersService');
jest.mock('@/modules/appointments/appointmentsService');

jest.mock('@/icons', () => ({
  EyeIcon: () => <span data-testid="eye-icon" />,
  PencilIcon: () => <span data-testid="pencil-icon" />,
}));

const makeOrder = (overrides = {}) => ({
  id: 1,
  customerId: 1,
  customer: { id: 1, name: 'João Silva' },
  transportTypeId: 1,
  transportType: { id: 1, name: 'Carreta', type: 'CARRETA' },
  orderStatusId: 1,
  orderStatus: { id: 1, name: 'Criada', status: 'CRIADA' },
  items: [{ id: 1, name: 'Pneu R15', OrderItem: { quantity: 2 } }],
  appointment: null,
  createdAt: '2026-07-10T18:00:00.000Z',
  ...overrides,
});

const mockStatuses = [
  { id: 1, name: 'Criada', status: 'CRIADA' },
  { id: 2, name: 'Planejada', status: 'PLANEJADA' },
];
const mockCustomers = { data: [{ id: 1, name: 'João Silva' }, { id: 2, name: 'Maria Souza' }], totalPages: 1 };
const mockTransportTypes = [{ id: 1, name: 'Carreta', type: 'CARRETA' }, { id: 2, name: 'Caminhão', type: 'CAMINHAO' }];
const mockAppointmentStatuses = [{ id: 1, name: 'Pendente', status: 'PENDENTE' }];

const defaultResponse = (orders = [makeOrder()]) => ({
  data: orders,
  total: orders.length,
  page: 1,
  limit: 10,
  totalPages: 1,
});

beforeEach(() => {
  jest.clearAllMocks();
  mockSearchParams = new URLSearchParams();
  (ordersService.getOrders as jest.Mock).mockResolvedValue(defaultResponse());
  (ordersService.getOrderStatuses as jest.Mock).mockResolvedValue(mockStatuses);
  (ordersService.getCustomers as jest.Mock).mockResolvedValue(mockCustomers);
  (ordersService.getTransportTypes as jest.Mock).mockResolvedValue(mockTransportTypes);
  (appointmentsService.getAppointmentStatuses as jest.Mock).mockResolvedValue(mockAppointmentStatuses);
});

// ─── Carregamento ────────────────────────────────────────────────────────────

describe('carregamento', () => {
  it('exibe estado de carregando inicialmente', () => {
    render(<Orders />, { wrapper: createWrapper() });
    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });

  it('exibe a lista de ordens após carregar', async () => {
    render(<Orders />, { wrapper: createWrapper() });
    await waitFor(() => expect(screen.getByText('João Silva')).toBeInTheDocument());
    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getAllByText('Carreta').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Criada').length).toBeGreaterThan(0);
  });

  it('exibe a data formatada em pt-BR', async () => {
    render(<Orders />, { wrapper: createWrapper() });
    await waitFor(() => expect(screen.getByText('João Silva')).toBeInTheDocument());
    expect(screen.getByText(/10\/07\/2026/)).toBeInTheDocument();
  });

  it('exibe a quantidade de itens da ordem', async () => {
    render(<Orders />, { wrapper: createWrapper() });
    await waitFor(() => expect(screen.getByText('João Silva')).toBeInTheDocument());
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('exibe mensagem quando não há ordens', async () => {
    (ordersService.getOrders as jest.Mock).mockResolvedValue(defaultResponse([]));
    render(<Orders />, { wrapper: createWrapper() });
    await waitFor(() => expect(screen.getByText('Nenhuma ordem encontrada.')).toBeInTheDocument());
  });

  it('exibe mensagem de erro quando a requisição falha', async () => {
    (ordersService.getOrders as jest.Mock).mockRejectedValue(new Error('Erro'));
    render(<Orders />, { wrapper: createWrapper() });
    await waitFor(() => expect(screen.getByText('Erro ao carregar ordens.')).toBeInTheDocument());
  });
});

// ─── Navegação ───────────────────────────────────────────────────────────────

describe('navegação', () => {
  it('navega para /orders/new ao clicar em Nova Ordem', async () => {
    render(<Orders />, { wrapper: createWrapper() });
    fireEvent.click(screen.getByText('+ Nova Ordem'));
    expect(mockPush).toHaveBeenCalledWith('/orders/new');
  });

  it('exibe links de visualização e edição para cada ordem', async () => {
    render(<Orders />, { wrapper: createWrapper() });
    await waitFor(() => expect(screen.getByText('#1')).toBeInTheDocument());
    const links = screen.getAllByRole('link');
    const orderLinks = links.filter((l) => l.getAttribute('href')?.startsWith('/orders/1'));
    expect(orderLinks.some((l) => l.getAttribute('href') === '/orders/1')).toBe(true);
    expect(orderLinks.some((l) => l.getAttribute('href') === '/orders/1?edit=true')).toBe(true);
  });

  it('navega para a página correta ao mudar de página', async () => {
    (ordersService.getOrders as jest.Mock).mockResolvedValue({ ...defaultResponse(), totalPages: 3 });
    render(<Orders />, { wrapper: createWrapper() });
    await waitFor(() => expect(screen.getByText('João Silva')).toBeInTheDocument());
    const page2 = screen.getByRole('button', { name: '2' });
    fireEvent.click(page2);
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('page=2'));
  });

  it('não exibe paginação quando há apenas uma página', async () => {
    render(<Orders />, { wrapper: createWrapper() });
    await waitFor(() => expect(screen.getByText('João Silva')).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: '2' })).not.toBeInTheDocument();
  });
});

// ─── Filtros ─────────────────────────────────────────────────────────────────

describe('filtros', () => {
  const getSelects = () => screen.getAllByRole('combobox');

  it('popula os selects de filtro com dados da API', async () => {
    render(<Orders />, { wrapper: createWrapper() });
    await waitFor(() => expect(screen.getByText('João Silva')).toBeInTheDocument());
    expect(screen.getByRole('option', { name: 'Criada' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Planejada' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Carreta' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Caminhão' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'João Silva' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Maria Souza' })).toBeInTheDocument();
  });

  it('filtra por cliente', async () => {
    render(<Orders />, { wrapper: createWrapper() });
    await waitFor(() => expect(screen.getByText('João Silva')).toBeInTheDocument());
    fireEvent.change(getSelects()[0], { target: { value: '1' } });
    await waitFor(() =>
      expect(ordersService.getOrders).toHaveBeenCalledWith(1, 10, expect.objectContaining({ customerId: 1 })),
    );
  });

  it('filtra por status', async () => {
    render(<Orders />, { wrapper: createWrapper() });
    await waitFor(() => expect(screen.getByText('João Silva')).toBeInTheDocument());
    fireEvent.change(getSelects()[1], { target: { value: '1' } });
    await waitFor(() =>
      expect(ordersService.getOrders).toHaveBeenCalledWith(1, 10, expect.objectContaining({ orderStatusId: 1 })),
    );
  });

  it('filtra por tipo de transporte', async () => {
    render(<Orders />, { wrapper: createWrapper() });
    await waitFor(() => expect(screen.getByText('João Silva')).toBeInTheDocument());
    fireEvent.change(getSelects()[2], { target: { value: '1' } });
    await waitFor(() =>
      expect(ordersService.getOrders).toHaveBeenCalledWith(1, 10, expect.objectContaining({ transportTypeId: 1 })),
    );
  });

  it('filtra por data', async () => {
    render(<Orders />, { wrapper: createWrapper() });
    await waitFor(() => expect(screen.getByText('João Silva')).toBeInTheDocument());
    const dateInput = screen.getByDisplayValue('');
    fireEvent.change(dateInput, { target: { value: '2026-07-10' } });
    await waitFor(() =>
      expect(ordersService.getOrders).toHaveBeenCalledWith(1, 10, expect.objectContaining({ date: '2026-07-10' })),
    );
  });

  it('exibe botão Limpar filtros ao aplicar um filtro', async () => {
    render(<Orders />, { wrapper: createWrapper() });
    await waitFor(() => expect(screen.getByText('João Silva')).toBeInTheDocument());
    expect(screen.queryByText('Limpar filtros')).not.toBeInTheDocument();
    fireEvent.change(getSelects()[1], { target: { value: '1' } });
    await waitFor(() => expect(screen.getByText('Limpar filtros')).toBeInTheDocument());
  });

  it('limpa todos os filtros ao clicar em Limpar filtros', async () => {
    render(<Orders />, { wrapper: createWrapper() });
    await waitFor(() => expect(screen.getByText('João Silva')).toBeInTheDocument());
    fireEvent.change(getSelects()[1], { target: { value: '1' } });
    await waitFor(() => expect(screen.getByText('Limpar filtros')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Limpar filtros'));
    await waitFor(() =>
      expect(ordersService.getOrders).toHaveBeenCalledWith(1, 10, {}),
    );
    expect(screen.queryByText('Limpar filtros')).not.toBeInTheDocument();
  });

  it('reseta para página 1 ao alterar filtro', async () => {
    mockSearchParams = new URLSearchParams('page=3');
    render(<Orders />, { wrapper: createWrapper() });
    await waitFor(() => expect(screen.getByText('João Silva')).toBeInTheDocument());
    fireEvent.change(getSelects()[1], { target: { value: '1' } });
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('page=1')));
  });
});

// ─── Agendamento ─────────────────────────────────────────────────────────────

describe('agendamento', () => {
  const orderPlanejada = makeOrder({
    id: 2,
    orderStatusId: 2,
    orderStatus: { id: 2, name: 'Planejada', status: 'PLANEJADA' },
    appointment: null,
  });

  const orderComAgendamento = makeOrder({
    id: 3,
    orderStatusId: 2,
    orderStatus: { id: 2, name: 'Planejada', status: 'PLANEJADA' },
    appointment: {
      id: 10,
      orderId: 3,
      appointmentStatusId: 1,
      appointmentStatus: { id: 1, name: 'Pendente', status: 'PENDENTE' },
      deliveryDate: '2026-07-15',
      startTime: '08:00',
      endTime: '10:00',
      confirmedAt: null,
      createdAt: '2026-07-10T18:00:00.000Z',
    },
  });

  it('exibe botão Agendar para ordem PLANEJADA sem agendamento', async () => {
    (ordersService.getOrders as jest.Mock).mockResolvedValue(defaultResponse([orderPlanejada]));
    render(<Orders />, { wrapper: createWrapper() });
    await waitFor(() => expect(screen.getByText('Agendar')).toBeInTheDocument());
  });

  it('não exibe botão Agendar para ordem com status diferente de PLANEJADA', async () => {
    render(<Orders />, { wrapper: createWrapper() });
    await waitFor(() => expect(screen.getByText('João Silva')).toBeInTheDocument());
    expect(screen.queryByText('Agendar')).not.toBeInTheDocument();
  });

  it('abre o modal de agendamento ao clicar em Agendar', async () => {
    (ordersService.getOrders as jest.Mock).mockResolvedValue(defaultResponse([orderPlanejada]));
    render(<Orders />, { wrapper: createWrapper() });
    await waitFor(() => expect(screen.getByText('Agendar')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Agendar'));
    await waitFor(() =>
      expect(screen.getByText(`Agendar Ordem #2 — João Silva`)).toBeInTheDocument(),
    );
  });

  it('fecha o modal de agendamento ao clicar em Cancelar', async () => {
    (ordersService.getOrders as jest.Mock).mockResolvedValue(defaultResponse([orderPlanejada]));
    render(<Orders />, { wrapper: createWrapper() });
    await waitFor(() => fireEvent.click(screen.getByText('Agendar')));
    await waitFor(() => expect(screen.getByText(`Agendar Ordem #2 — João Silva`)).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    await waitFor(() =>
      expect(screen.queryByText(`Agendar Ordem #2 — João Silva`)).not.toBeInTheDocument(),
    );
  });

  it('submete o formulário de agendamento com os dados corretos', async () => {
    (ordersService.getOrders as jest.Mock).mockResolvedValue(defaultResponse([orderPlanejada]));
    (appointmentsService.createAppointment as jest.Mock).mockResolvedValue({});
    render(<Orders />, { wrapper: createWrapper() });
    await waitFor(() => fireEvent.click(screen.getByText('Agendar')));
    await waitFor(() => expect(screen.getByText(`Agendar Ordem #2 — João Silva`)).toBeInTheDocument());
    const form = screen.getByRole('button', { name: 'Confirmar Agendamento' }).closest('form')!;
    const [dateInput, startInput, endInput] = Array.from(form.querySelectorAll('input[type="date"], input[type="time"]'));
    fireEvent.change(dateInput, { target: { value: '2026-07-20' } });
    fireEvent.change(startInput, { target: { value: '08:00' } });
    fireEvent.change(endInput, { target: { value: '10:00' } });
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar Agendamento' }));
    await waitFor(() =>
      expect(appointmentsService.createAppointment).toHaveBeenCalledWith(
        expect.objectContaining({ orderId: 2, deliveryDate: '2026-07-20', startTime: '08:00', endTime: '10:00' }),
      ),
    );
  });

  it('exibe botão Confirmar para ordem PLANEJADA com agendamento', async () => {
    (ordersService.getOrders as jest.Mock).mockResolvedValue(defaultResponse([orderComAgendamento]));
    render(<Orders />, { wrapper: createWrapper() });
    await waitFor(() => expect(screen.getByText('Confirmar')).toBeInTheDocument());
  });

  it('abre o modal de confirmação ao clicar em Confirmar', async () => {
    (ordersService.getOrders as jest.Mock).mockResolvedValue(defaultResponse([orderComAgendamento]));
    render(<Orders />, { wrapper: createWrapper() });
    await waitFor(() => fireEvent.click(screen.getByText('Confirmar')));
    await waitFor(() =>
      expect(screen.getByText('Deseja confirmar o agendamento da Ordem #3?')).toBeInTheDocument(),
    );
    expect(screen.getByText('2026-07-15')).toBeInTheDocument();
  });

  it('chama confirmAppointment ao confirmar o agendamento', async () => {
    (ordersService.getOrders as jest.Mock).mockResolvedValue(defaultResponse([orderComAgendamento]));
    (appointmentsService.confirmAppointment as jest.Mock).mockResolvedValue({});
    render(<Orders />, { wrapper: createWrapper() });
    await waitFor(() => fireEvent.click(screen.getByText('Confirmar')));
    await waitFor(() => expect(screen.getByText('Deseja confirmar o agendamento da Ordem #3?')).toBeInTheDocument());
    const modal = screen.getByText('Confirmar Agendamento').closest('div')!.parentElement!;
    fireEvent.click(modal.querySelector('button:last-child')!);
    await waitFor(() =>
      expect(appointmentsService.confirmAppointment).toHaveBeenCalledWith(10),
    );
  });

  it('fecha o modal de confirmação ao clicar em Cancelar', async () => {
    (ordersService.getOrders as jest.Mock).mockResolvedValue(defaultResponse([orderComAgendamento]));
    render(<Orders />, { wrapper: createWrapper() });
    await waitFor(() => fireEvent.click(screen.getByText('Confirmar')));
    await waitFor(() => expect(screen.getByText('Deseja confirmar o agendamento da Ordem #3?')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    await waitFor(() =>
      expect(screen.queryByText('Deseja confirmar o agendamento da Ordem #3?')).not.toBeInTheDocument(),
    );
  });
});

// ─── Múltiplas ordens ────────────────────────────────────────────────────────

describe('múltiplas ordens', () => {
  it('renderiza todas as ordens da resposta', async () => {
    const orders = [
      makeOrder({ id: 1, customer: { id: 1, name: 'João Silva' } }),
      makeOrder({ id: 2, customer: { id: 2, name: 'Maria Souza' } }),
    ];
    (ordersService.getOrders as jest.Mock).mockResolvedValue(defaultResponse(orders));
    render(<Orders />, { wrapper: createWrapper() });
    await waitFor(() => expect(screen.getAllByText('#1').length).toBeGreaterThanOrEqual(1));
    expect(screen.getAllByText('#2').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('João Silva').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Maria Souza').length).toBeGreaterThanOrEqual(1);
  });

  it('exibe "-" quando cliente ou transporte estão ausentes', async () => {
    const order = makeOrder({ customer: undefined, transportType: undefined });
    (ordersService.getOrders as jest.Mock).mockResolvedValue(defaultResponse([order]));
    render(<Orders />, { wrapper: createWrapper() });
    await waitFor(() => expect(screen.getByText('#1')).toBeInTheDocument());
    expect(screen.getAllByText('-').length).toBeGreaterThanOrEqual(2);
  });
});
