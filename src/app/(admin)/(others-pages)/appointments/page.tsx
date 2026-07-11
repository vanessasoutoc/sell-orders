'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import OrdersTable from '@/modules/orders/OrdersTable';
import OrdersFilters from '@/modules/orders/OrdersFilters';
import { getOrders, OrderFilters } from '@/modules/orders/ordersService';
import { getAppointments } from '@/modules/appointments/appointmentsService';
import AppointmentsTable from '@/modules/appointments/AppointmentsTable';

export default function Appointments() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentPage = Number(searchParams.get('page')) || 1;

  // const [filters, setFilters] = useState<OrderFilters>({});

  const { data, isLoading, isError } = useQuery({
    queryKey: ['appointments', currentPage],
    queryFn: () => getAppointments(currentPage, 10),
  });

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    router.push(`?${params.toString()}`);
  };

  const handleFiltersChange = (newFilters: OrderFilters) => {
    // setFilters(newFilters);
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Central de Agendamento" />
      <div className="space-y-6">
        <div className="flex justify-end">
          <button
            onClick={() => router.push('/appointments/new')}
            className="h-10 rounded-lg bg-brand-500 px-5 text-sm text-white hover:bg-brand-600"
          >
            + Nova Agendamento
          </button>
        </div>
        <ComponentCard>
          {/* <OrdersFilters filters={filters} onChange={handleFiltersChange} /> */}
          {isLoading && (
            <p className="py-6 text-center text-gray-500 text-theme-sm dark:text-gray-400">Carregando...</p>
          )}
          {isError && (
            <p className="py-6 text-center text-red-500 text-theme-sm">Erro ao carregar ordens.</p>
          )}
          {data && (
            <AppointmentsTable
              data={data.data}
              totalPages={data.totalPages}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />
          )}
        </ComponentCard>
      </div>
    </div>
  );
}
