import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import OrderForm from '@/modules/orders/OrderForm';

export default function NewOrder() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Nova Ordem" />
      <OrderForm />
    </div>
  );
}
