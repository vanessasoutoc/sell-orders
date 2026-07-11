import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { getCustomers } from '@/modules/customers/customersService';
import CustomersTable from '@/modules/customers/components/CustomersTable';

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function Customers({ searchParams }: Props) {
  const { page } = await searchParams;
  const currentPage = Number(page) || 1;
  const { data, totalPages } = await getCustomers(currentPage, 10);

  return (
    <div>
      <PageBreadcrumb pageTitle="Clientes" />
      <div className="space-y-6">
        <ComponentCard>
          <CustomersTable data={data} totalPages={totalPages} currentPage={currentPage} />
        </ComponentCard>
      </div>
    </div>
  );
}
