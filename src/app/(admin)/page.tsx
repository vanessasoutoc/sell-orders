import { Metrics } from "@/components/dashboard/Metrics";
import RecentOrders from "@/components/dashboard/RecentOrders";
import { getDashboardSummary } from "@/modules/dashboard/dashboardService";
import { getOrders } from "@/modules/orders/ordersService";

export default async function Dashboard() {
  const [summary, { data: recentOrders }] = await Promise.all([
    getDashboardSummary(),
    getOrders(1, 5, { sortOrder: 'desc' }),
  ]);

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 space-y-6 xl:col-span-12">
        <Metrics data={summary} />
      </div>

      <div className="col-span-12 xl:col-span-12">
        <RecentOrders orders={recentOrders} />
      </div>
    </div>
  );
}
