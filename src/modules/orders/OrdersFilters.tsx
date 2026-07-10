'use client';

import { useQuery } from '@tanstack/react-query';
import { OrderFilters, getCustomers, getOrderStatuses, getTransportTypes } from './ordersService';

interface Props {
  filters: OrderFilters;
  onChange: (filters: OrderFilters) => void;
}

export default function OrdersFilters({ filters, onChange }: Props) {
  const { data: statusesData } = useQuery({ queryKey: ['order-statuses'], queryFn: getOrderStatuses });
  const { data: customersData } = useQuery({ queryKey: ['customers-select'], queryFn: () => getCustomers() });
  const { data: transportTypesData } = useQuery({ queryKey: ['transport-types'], queryFn: getTransportTypes });

  const statuses = statusesData;
  const customers = customersData?.data;
  const transportTypes = transportTypesData;

  const selectClass =
    'h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 shadow-theme-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300';

  const hasFilters = !!(filters.customerId || filters.orderStatusId || filters.transportTypeId || filters.date);

  return (
    <div className="mb-5">
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <select
        className={selectClass}
        value={filters.customerId ?? ''}
        onChange={(e) => onChange({ ...filters, customerId: e.target.value ? Number(e.target.value) : undefined })}
      >
        <option value="">Todos os clientes</option>
        {customers?.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      <select
        className={selectClass}
        value={filters.orderStatusId ?? ''}
        onChange={(e) => onChange({ ...filters, orderStatusId: e.target.value ? Number(e.target.value) : undefined })}
      >
        <option value="">Todos os status</option>
        {statuses?.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>

      <select
        className={selectClass}
        value={filters.transportTypeId ?? ''}
        onChange={(e) => onChange({ ...filters, transportTypeId: e.target.value ? Number(e.target.value) : undefined })}
      >
        <option value="">Todos os transportes</option>
        {transportTypes?.map((t) => (
          <option key={t.id} value={t.id}>{t.name}</option>
        ))}
      </select>

      <input
        type="date"
        className={selectClass}
        value={filters.date ?? ''}
        onChange={(e) => onChange({ ...filters, date: e.target.value || undefined })}
      />
    </div>
    {hasFilters && (
      <button
        onClick={() => onChange({})}
        className="mt-3 text-sm text-brand-500 hover:underline dark:text-brand-400"
      >
        Limpar filtros
      </button>
    )}
    </div>
  );
}
