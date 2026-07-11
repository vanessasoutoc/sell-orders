'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../ui/table';
import Badge from '../ui/badge/Badge';
import Pagination from '../tables/Pagination';
import { getOrders, getOrderStatuses, getCustomers, getTransportTypes, OrderFilters } from '@/modules/orders/ordersService';

const statusColor: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
  CRIADA: 'warning',
  PLANEJADA: 'warning',
  EM_TRANSPORTE: 'info',
  AGENDADA: 'info',
  ENTREGUE: 'success',
};

const selectClass =
  'h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 shadow-theme-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300';

export default function RecentOrders() {
  const [filters, setFilters] = useState<OrderFilters>({ sortOrder: 'desc' });
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['recent-orders', filters, page],
    queryFn: () => getOrders(page, 5, filters),
  });

  const { data: statuses } = useQuery({ queryKey: ['order-statuses'], queryFn: getOrderStatuses });
  const { data: customersData } = useQuery({ queryKey: ['customers-select'], queryFn: () => getCustomers() });
  const { data: transportTypes } = useQuery({ queryKey: ['transport-types-select'], queryFn: getTransportTypes });

  const hasFilters = !!(filters.customerId || filters.orderStatusId || filters.transportTypeId || filters.date);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Ordens Recentes</h3>
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
        >
          Ver todas
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3 sm:grid-cols-4">
        <select
          className={selectClass}
          value={filters.orderStatusId ?? ''}
          onChange={(e) => { setFilters((f) => ({ ...f, orderStatusId: e.target.value ? Number(e.target.value) : undefined })); setPage(1); }}
        >
          <option value="">Todos os status</option>
          {statuses?.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>

        <select
          className={selectClass}
          value={filters.customerId ?? ''}
          onChange={(e) => { setFilters((f) => ({ ...f, customerId: e.target.value ? Number(e.target.value) : undefined })); setPage(1); }}
        >
          <option value="">Todos os clientes</option>
          {customersData?.data.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <select
          className={selectClass}
          value={filters.transportTypeId ?? ''}
          onChange={(e) => { setFilters((f) => ({ ...f, transportTypeId: e.target.value ? Number(e.target.value) : undefined })); setPage(1); }}
        >
          <option value="">Todos os transportes</option>
          {transportTypes?.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>

        <input
          type="date"
          className={selectClass}
          value={filters.date ?? ''}
          onChange={(e) => { setFilters((f) => ({ ...f, date: e.target.value || undefined })); setPage(1); }}
        />
      </div>

      {hasFilters && (
        <button
          onClick={() => { setFilters({ sortOrder: 'desc' }); setPage(1); }}
          className="mb-3 text-sm text-brand-500 hover:underline dark:text-brand-400"
        >
          Limpar filtros
        </button>
      )}

      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              {['#', 'Cliente', 'Transporte', 'Status', 'Data'].map((h) => (
                <TableCell key={h} isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {isLoading ? (
              <TableRow>
                <TableCell className="px-5 py-4 text-center text-gray-500 text-theme-sm dark:text-gray-400" colSpan={5}>
                  Carregando...
                </TableCell>
              </TableRow>
            ) : data?.data.length === 0 ? (
              <TableRow>
                <TableCell className="px-5 py-4 text-center text-gray-500 text-theme-sm dark:text-gray-400" colSpan={5}>
                  Nenhuma ordem encontrada.
                </TableCell>
              </TableRow>
            ) : (
              data?.data.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">#{order.id}</TableCell>
                  <TableCell className="px-5 py-4 font-medium text-gray-800 text-theme-sm dark:text-white/90">{order.customer.name}</TableCell>
                  <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">{order.transportType.name}</TableCell>
                  <TableCell className="px-5 py-4">
                    <Badge size="sm" color={statusColor[order.orderStatus.status] ?? 'info'}>
                      {order.orderStatus.name}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {(data?.totalPages ?? 0) > 1 && (
        <div className="px-1 py-3">
          <Pagination currentPage={page} totalPages={data!.totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
