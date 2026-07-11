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

// ─── Testes unitários: isValidTransition ─────────────────────────────────────

describe('isValidTransition — transições válidas', () => {
  it('CRIADA → PLANEJADA é válida', () => {
    expect(isValidTransition('CRIADA', 'PLANEJADA')).toBe(true);
  });

  it('PLANEJADA → AGENDADA é válida', () => {
    expect(isValidTransition('PLANEJADA', 'AGENDADA')).toBe(true);
  });

  it('AGENDADA → EM_TRANSPORTE é válida', () => {
    expect(isValidTransition('AGENDADA', 'EM_TRANSPORTE')).toBe(true);
  });

  it('EM_TRANSPORTE → ENTREGUE é válida', () => {
    expect(isValidTransition('EM_TRANSPORTE', 'ENTREGUE')).toBe(true);
  });
});

describe('isValidTransition — transições inválidas', () => {
  it('CRIADA → AGENDADA é inválida (pula etapa)', () => {
    expect(isValidTransition('CRIADA', 'AGENDADA')).toBe(false);
  });

  it('CRIADA → EM_TRANSPORTE é inválida (pula etapas)', () => {
    expect(isValidTransition('CRIADA', 'EM_TRANSPORTE')).toBe(false);
  });

  it('CRIADA → ENTREGUE é inválida (pula todas as etapas)', () => {
    expect(isValidTransition('CRIADA', 'ENTREGUE')).toBe(false);
  });

  it('PLANEJADA → CRIADA é inválida (retrocesso)', () => {
    expect(isValidTransition('PLANEJADA', 'CRIADA')).toBe(false);
  });

  it('ENTREGUE → qualquer status é inválida (status final)', () => {
    expect(isValidTransition('ENTREGUE', 'CRIADA')).toBe(false);
    expect(isValidTransition('ENTREGUE', 'PLANEJADA')).toBe(false);
    expect(isValidTransition('ENTREGUE', 'EM_TRANSPORTE')).toBe(false);
  });

  it('AGENDADA → PLANEJADA é inválida (retrocesso)', () => {
    expect(isValidTransition('AGENDADA', 'PLANEJADA')).toBe(false);
  });

  it('status inexistente é inválido', () => {
    expect(isValidTransition('INVALIDO', 'CRIADA')).toBe(false);
    expect(isValidTransition('CRIADA', 'INVALIDO')).toBe(false);
  });
});

// ─── Testes unitários: getAllowedStatuses ─────────────────────────────────────

describe('getAllowedStatuses — nova ordem', () => {
  it('exibe apenas CRIADA para nova ordem', () => {
    const result = getAllowedStatuses(ALL_STATUSES, true);
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe('CRIADA');
  });

  it('não exibe PLANEJADA, AGENDADA, EM_TRANSPORTE ou ENTREGUE para nova ordem', () => {
    const result = getAllowedStatuses(ALL_STATUSES, true);
    const statuses = result.map((s) => s.status);
    expect(statuses).not.toContain('PLANEJADA');
    expect(statuses).not.toContain('AGENDADA');
    expect(statuses).not.toContain('EM_TRANSPORTE');
    expect(statuses).not.toContain('ENTREGUE');
  });
});

describe('getAllowedStatuses — edição de ordem existente', () => {
  it('exibe CRIADA e PLANEJADA quando status atual é CRIADA', () => {
    const result = getAllowedStatuses(ALL_STATUSES, false, 'CRIADA');
    const statuses = result.map((s) => s.status);
    expect(statuses).toContain('CRIADA');
    expect(statuses).toContain('PLANEJADA');
    expect(statuses).toHaveLength(2);
  });

  it('exibe PLANEJADA e AGENDADA quando status atual é PLANEJADA', () => {
    const result = getAllowedStatuses(ALL_STATUSES, false, 'PLANEJADA');
    const statuses = result.map((s) => s.status);
    expect(statuses).toContain('PLANEJADA');
    expect(statuses).toContain('AGENDADA');
    expect(statuses).toHaveLength(2);
  });

  it('exibe AGENDADA e EM_TRANSPORTE quando status atual é AGENDADA', () => {
    const result = getAllowedStatuses(ALL_STATUSES, false, 'AGENDADA');
    const statuses = result.map((s) => s.status);
    expect(statuses).toContain('AGENDADA');
    expect(statuses).toContain('EM_TRANSPORTE');
    expect(statuses).toHaveLength(2);
  });

  it('exibe EM_TRANSPORTE e ENTREGUE quando status atual é EM_TRANSPORTE', () => {
    const result = getAllowedStatuses(ALL_STATUSES, false, 'EM_TRANSPORTE');
    const statuses = result.map((s) => s.status);
    expect(statuses).toContain('EM_TRANSPORTE');
    expect(statuses).toContain('ENTREGUE');
    expect(statuses).toHaveLength(2);
  });

  it('exibe apenas ENTREGUE quando status atual é ENTREGUE (status final)', () => {
    const result = getAllowedStatuses(ALL_STATUSES, false, 'ENTREGUE');
    const statuses = result.map((s) => s.status);
    expect(statuses).toContain('ENTREGUE');
    expect(statuses).toHaveLength(1);
  });

  it('não exibe status anteriores ao atual', () => {
    const result = getAllowedStatuses(ALL_STATUSES, false, 'EM_TRANSPORTE');
    const statuses = result.map((s) => s.status);
    expect(statuses).not.toContain('CRIADA');
    expect(statuses).not.toContain('PLANEJADA');
    expect(statuses).not.toContain('AGENDADA');
  });
});
