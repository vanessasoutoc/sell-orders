'use client';

import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import Pagination from '@/components/tables/Pagination';
import Badge from '@/components/ui/badge/Badge';
import { AuditLog } from './auditLogsService';

interface Props {
  data: AuditLog[];
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

const actionColor: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
  CRIADA: 'success',
  ALTERADA: 'info',
  DELETADA: 'error',
  STATUS_ALTERADO: 'warning',
};

export default function AuditLogsTable({ data, totalPages, currentPage, onPageChange }: Props) {
  return (
    <div>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                {['#', 'Entidade', 'ID', 'Ação', 'IP', 'Data'].map((h) => (
                  <TableCell
                    key={h}
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {data.length === 0 ? (
                <TableRow>
                  <TableCell className="px-5 py-4 text-center text-gray-500 text-theme-sm dark:text-gray-400" colSpan={6}>
                    Nenhum registro encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="px-5 py-4 text-gray-800 text-theme-sm dark:text-white/90">
                      #{log.id}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {log.entity}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {log.entityId}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-theme-sm">
                      <Badge size="sm" color={actionColor[log.action] ?? 'info'}>
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {log.ip ?? '-'}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {new Date(log.occurredAt).toLocaleString('pt-BR')}
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
