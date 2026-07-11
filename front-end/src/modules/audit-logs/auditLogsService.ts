import { getApiBaseUrl } from '../../lib/api';

export interface AuditLog {
  id: number;
  entity: string;
  entityId: number;
  action: string;
  before: object | null;
  after: object | null;
  ip: string | null;
  metadata: object | null;
  occurredAt: string;
  createdAt: string;
}

export interface PaginatedAuditLogs {
  data: AuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function getAuditLogs(page = 1, limit = 10): Promise<PaginatedAuditLogs> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  const res = await fetch(`${getApiBaseUrl()}/audit-logs?${params.toString()}`);
  if (!res.ok) throw new Error('Erro ao buscar logs de auditoria');
  return res.json();
}
