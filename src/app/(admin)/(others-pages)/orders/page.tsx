'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import OrdersTable from '@/modules/orders/OrdersTable';
import OrdersFilters from '@/modules/orders/OrdersFilters';
import { getOrders, OrderFilters } from '@/modules/orders/ordersService';

export default function Orders() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentPage = Number(searchParams.get('page')) || 1;

  const [filters, setFilters] = useState<OrderFilters>({});

  const { data, isLoading, isError } = useQuery({
    queryKey: ['orders', currentPage, filters],
    queryFn: () => getOrders(currentPage, 10, filters),
  });

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    router.push(`?${params.toString()}`);
  };

  const handleFiltersChange = (newFilters: OrderFilters) => {
    setFilters(newFilters);
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Ordens de Venda" />
      <div className="space-y-6">
        <ComponentCard>
          <OrdersFilters filters={filters} onChange={handleFiltersChange} />
          {isLoading && (
            <p className="py-6 text-center text-gray-500 text-theme-sm dark:text-gray-400">Carregando...</p>
          )}
          {isError && (
            <p className="py-6 text-center text-red-500 text-theme-sm">Erro ao carregar ordens.</p>
          )}
          {data && (
            <OrdersTable
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
