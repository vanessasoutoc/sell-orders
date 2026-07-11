import { getApiBaseUrl } from '../../lib/api';

export interface Customer {
  id: number;
  name: string;
  cellphone: string;
  email: string;
}

export interface PaginatedCustomers {
  data: Customer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function getCustomers(page = 1, limit = 10): Promise<PaginatedCustomers> {
  const res = await fetch(`${getApiBaseUrl()}/customers?page=${page}&limit=${limit}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Erro ao buscar clientes');
  return res.json();
}
