export interface DashboardSummary {
  orders: number;
  customers: number;
  appointments: number;
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const res = await fetch('http://localhost:3000/dashboard/summary');
  if (!res.ok) throw new Error('Erro ao buscar resumo do dashboard');
  return res.json();
}
