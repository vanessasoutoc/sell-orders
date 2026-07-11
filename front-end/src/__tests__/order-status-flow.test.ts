/**
 * Testes unitários da lógica de fluxo de status de ordem.
 *
 * Cobrem a regra de negócio central:
 *   CRIADA → PLANEJADA → AGENDADA → EM_TRANSPORTE → ENTREGUE
 *
 * São testes puramente unitários: sem React, sem render, sem dependências externas.
 */

const STATUS_FLOW: Record<string, string> = {
  CRIADA: 'PLANEJADA',
  PLANEJADA: 'AGENDADA',
  AGENDADA: 'EM_TRANSPORTE',
  EM_TRANSPORTE: 'ENTREGUE',
};

function isValidTransition(current: string, next: string): boolean {
  return STATUS_FLOW[current] === next;
}

type OrderStatus = { id: number; name: string; status: string };

function getAllowedStatuses(statuses: OrderStatus[], isNew: boolean, currentStatus?: string): OrderStatus[] {
  return statuses.filter((s) => {
    if (isNew) return s.status === 'CRIADA';
    if (!currentStatus) return true;
    const next = STATUS_FLOW[currentStatus];
    return s.status === currentStatus || s.status === next;
  });
}

const ALL_STATUSES: OrderStatus[] = [
  { id: 1, name: 'Criada', status: 'CRIADA' },
  { id: 2, name: 'Planejada', status: 'PLANEJADA' },
  { id: 3, name: 'Agendada', status: 'AGENDADA' },
  { id: 4, name: 'Em Transporte', status: 'EM_TRANSPORTE' },
  { id: 5, name: 'Entregue', status: 'ENTREGUE' },
];

// ─── isValidTransition: transições válidas ───────────────────────────────────

describe('isValidTransition — transições válidas', () => {
  it.each([
    ['CRIADA', 'PLANEJADA'],
    ['PLANEJADA', 'AGENDADA'],
    ['AGENDADA', 'EM_TRANSPORTE'],
    ['EM_TRANSPORTE', 'ENTREGUE'],
  ])('%s → %s é válida', (current, next) => {
    expect(isValidTransition(current, next)).toBe(true);
  });
});

// ─── isValidTransition: transições inválidas ─────────────────────────────────

describe('isValidTransition — transições inválidas', () => {
  it.each([
    ['CRIADA', 'AGENDADA', 'pula etapa'],
    ['CRIADA', 'EM_TRANSPORTE', 'pula etapas'],
    ['CRIADA', 'ENTREGUE', 'pula todas as etapas'],
    ['PLANEJADA', 'CRIADA', 'retrocesso'],
    ['AGENDADA', 'PLANEJADA', 'retrocesso'],
    ['EM_TRANSPORTE', 'CRIADA', 'retrocesso para início'],
    ['ENTREGUE', 'EM_TRANSPORTE', 'status final não permite avanço'],
    ['INVALIDO', 'CRIADA', 'status inexistente como origem'],
    ['CRIADA', 'INVALIDO', 'status inexistente como destino'],
  ])('%s → %s é inválida (%s)', (current, next) => {
    expect(isValidTransition(current, next)).toBe(false);
  });
});

// ─── getAllowedStatuses: nova ordem ──────────────────────────────────────────

describe('getAllowedStatuses — nova ordem', () => {
  it('exibe apenas CRIADA', () => {
    const result = getAllowedStatuses(ALL_STATUSES, true);
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe('CRIADA');
  });

  it('não exibe nenhum status além de CRIADA', () => {
    const statuses = getAllowedStatuses(ALL_STATUSES, true).map((s) => s.status);
    expect(statuses).not.toContain('PLANEJADA');
    expect(statuses).not.toContain('AGENDADA');
    expect(statuses).not.toContain('EM_TRANSPORTE');
    expect(statuses).not.toContain('ENTREGUE');
  });
});

// ─── getAllowedStatuses: edição de ordem ─────────────────────────────────────

describe('getAllowedStatuses — edição de ordem existente', () => {
  it.each([
    ['CRIADA', ['CRIADA', 'PLANEJADA']],
    ['PLANEJADA', ['PLANEJADA', 'AGENDADA']],
    ['AGENDADA', ['AGENDADA', 'EM_TRANSPORTE']],
    ['EM_TRANSPORTE', ['EM_TRANSPORTE', 'ENTREGUE']],
  ])('status atual %s: exibe apenas o atual e o próximo', (current, expected) => {
    const result = getAllowedStatuses(ALL_STATUSES, false, current).map((s) => s.status);
    expect(result).toEqual(expect.arrayContaining(expected));
    expect(result).toHaveLength(2);
  });

  it('ENTREGUE: exibe apenas o status final (sem próximo)', () => {
    const result = getAllowedStatuses(ALL_STATUSES, false, 'ENTREGUE');
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe('ENTREGUE');
  });

  it('não exibe status anteriores ao atual', () => {
    const result = getAllowedStatuses(ALL_STATUSES, false, 'EM_TRANSPORTE').map((s) => s.status);
    expect(result).not.toContain('CRIADA');
    expect(result).not.toContain('PLANEJADA');
    expect(result).not.toContain('AGENDADA');
  });
});
