import Link from 'next/link';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../ui/table';
import Badge from '../ui/badge/Badge';
import { Order } from '@/modules/orders/ordersService';

const statusColor = (status: string) => {
  const map: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
    entregue: 'success',
    pendente: 'warning',
    cancelado: 'error',
  };
  return map[status.toLowerCase()] ?? 'info';
};

export default function RecentOrders({ orders }: { orders: Order[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Ordens Recentes</h3>
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
        >
          Ver todas
        </Link>
      </div>

      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              {['#', 'Cliente', 'Transporte', 'Status', 'Criado(a) em'].map((h) => (
                <TableCell key={h} isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  #{order.id}
                </TableCell>
                <TableCell className="py-3 font-medium text-gray-800 text-theme-sm dark:text-white/90">
                  {order.customer.name}
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {order.transportType.name}
                </TableCell>
                <TableCell className="py-3">
                  <Badge size="sm" color={statusColor(order.orderStatus.name)}>
                    {order.orderStatus.name}
                  </Badge>
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {new Date(order.createdAt).toLocaleString('pt-BR')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
