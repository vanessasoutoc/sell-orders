import { notFound } from 'next/navigation';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import OrderForm from '@/modules/orders/OrderForm';
import { getOrder } from '@/modules/orders/ordersService';

export default async function OrderDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ edit?: string }> }) {
  const { id } = await params;
  const { edit } = await searchParams;
  const order = await getOrder(Number(id)).catch(() => null);
  if (!order) notFound();

  return (
    <div>
      <PageBreadcrumb pageTitle={`Ordem #${order.id}`} />
      <OrderForm order={order} initialEditing={edit === 'true'} />
    </div>
  );
}
