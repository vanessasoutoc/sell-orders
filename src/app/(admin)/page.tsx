import { Metrics } from "@/components/dashboard/Metrics";
import RecentOrders from "@/components/dashboard/RecentOrders";



export default function Dashboard() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 space-y-6 xl:col-span-12">
        <Metrics />
      </div>

      <div className="col-span-12 xl:col-span-12">
        <RecentOrders />
      </div>
    </div>
  );
}
