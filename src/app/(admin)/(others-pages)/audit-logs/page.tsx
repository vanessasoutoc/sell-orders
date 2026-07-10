'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import AuditLogsTable from '@/modules/audit-logs/AuditLogsTable';
import { getAuditLogs } from '@/modules/audit-logs/auditLogsService';

export default function AuditLogs() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentPage = Number(searchParams.get('page')) || 1;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['audit-logs', currentPage],
    queryFn: () => getAuditLogs(currentPage, 10),
  });

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    router.push(`?${params.toString()}`);
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Auditoria" />
      <div className="space-y-6">
        <ComponentCard>
          {isLoading && (
            <p className="py-6 text-center text-gray-500 text-theme-sm dark:text-gray-400">Carregando...</p>
          )}
          {isError && (
            <p className="py-6 text-center text-red-500 text-theme-sm">Erro ao carregar logs.</p>
          )}
          {data && (
            <AuditLogsTable
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
