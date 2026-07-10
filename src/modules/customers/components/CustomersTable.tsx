'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import Pagination from '@/components/tables/Pagination';
import { Customer } from '../customersService';

interface Props {
  data: Customer[];
  totalPages: number;
  currentPage: number;
}

export default function CustomersTable({ data, totalPages, currentPage }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    router.push(`?${params.toString()}`);
  };

  return (
    <div>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                {['Nome', 'E-mail', 'Telefone'].map((h) => (
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
                  <TableCell className="px-5 py-4 text-center text-gray-500 text-theme-sm dark:text-gray-400" colSpan={7}>
                    Nenhum cliente encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="px-5 py-4 text-gray-800 text-theme-sm dark:text-white/90">{customer.name}</TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">{customer.email}</TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">{customer.cellphone}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      {totalPages > 1 && (
        <div className="px-5 py-4 sm:px-6">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      )}
    </div>
  );
}
