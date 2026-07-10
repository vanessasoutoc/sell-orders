'use client';

import { useQuery } from '@tanstack/react-query';
import { GroupIcon, ListIcon, CalenderIcon } from '@/icons';
import { getDashboardSummary } from '@/modules/dashboard/dashboardService';

export const Metrics = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: getDashboardSummary,
  });

  const metrics = [
    { label: 'Clientes', value: data?.customers, icon: <GroupIcon className="text-gray-800 size-6 dark:text-white/90" /> },
    { label: 'Ordens', value: data?.orders, icon: <ListIcon className="text-gray-800 dark:text-white/90" /> },
    { label: 'Agendamentos', value: data?.appointments, icon: <CalenderIcon className="text-gray-800 dark:text-white/90" /> },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
      {metrics.map(({ label, value, icon }) => (
        <div key={label} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            {icon}
          </div>
          <div className="mt-5">
            <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {isLoading ? '...' : (value ?? 0).toLocaleString('pt-BR')}
            </h4>
          </div>
        </div>
      ))}
    </div>
  );
};
