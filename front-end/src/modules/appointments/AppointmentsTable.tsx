'use client';

import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import Pagination from '@/components/tables/Pagination';
import Badge from '@/components/ui/badge/Badge';
import { Appointment } from './appointmentsService';
import { EyeIcon, PencilIcon } from '@/icons';

interface Props {
  data: Appointment[];
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

const statusColor: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
  PENDENTE: 'warning',
  CONFIRMADO: 'info',
  CONCLUIDO: 'success',
  CANCELADO: 'error',
};

const cellClass = 'px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400';

export default function AppointmentsTable({ data, totalPages, currentPage, onPageChange }: Props) {
  return (
    <div>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                {['#', 'Ordem', 'Cliente', 'Data de Entrega', 'Horário', 'Status', ''].map((h) => (
                  <TableCell key={h} isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {data.length === 0 ? (
                <TableRow>
                  <TableCell className="px-5 py-4 text-center text-gray-500 text-theme-sm dark:text-gray-400" colSpan={7}>
                    Nenhum agendamento encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell className={cellClass}>#{appointment.id}</TableCell>
                    <TableCell className={cellClass}>#{appointment.order?.id ?? '-'}</TableCell>
                    <TableCell className="px-5 py-4 font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {appointment.order?.customer?.name ?? '-'}
                    </TableCell>
                    <TableCell className={cellClass}>
                      {appointment.deliveryDate
                        ? new Date(appointment.deliveryDate).toLocaleDateString('pt-BR')
                        : '-'}
                    </TableCell>
                    <TableCell className={cellClass}>
                      {appointment.startTime && appointment.endTime
                        ? `${appointment.startTime} - ${appointment.endTime}`
                        : '-'}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      {appointment.appointmentStatus ? (
                        <Badge size="sm" color={statusColor[appointment.appointmentStatus.status] ?? 'info'}>
                          {appointment.appointmentStatus.name}
                        </Badge>
                      ) : '-'}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400 flex items-center gap-2">
                      <a href={`/appointments/${appointment.id}`} className="text-brand-500 hover:underline dark:text-brand-400">
                        <EyeIcon />
                      </a>
                      <a href={`/appointments/${appointment.id}?edit=true`} className="text-brand-500 hover:underline dark:text-brand-400">
                        <PencilIcon />
                      </a>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      {totalPages > 1 && (
        <div className="px-5 py-4 sm:px-6">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
        </div>
      )}
    </div>
  );
}
