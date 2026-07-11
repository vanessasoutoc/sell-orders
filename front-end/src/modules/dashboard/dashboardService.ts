import { Order } from "../orders/ordersService";
import { getApiBaseUrl } from "../../lib/api";

export interface DashboardSummary {
  orders: number;
  customers: number;
  appointments: number;
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const res = await fetch(`${getApiBaseUrl()}/summary`);
  if (!res.ok) throw new Error('Erro ao buscar resumo do dashboard');
  return res.json();
}

export async function getRecentOrders(limit = 10): Promise<Order[]> {
  const res = await fetch(`${getApiBaseUrl()}/orders?limit=${limit}&sortOrder=desc`);
  if (!res.ok) throw new Error('Erro ao buscar ordens recentes');
  return res.json();
}
