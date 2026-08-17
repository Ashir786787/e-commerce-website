"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const RevenueChart = dynamic(
  () => import("@/components/admin/dashboard/RevenueChart"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
      </div>
    ),
  }
);

const OrderStatusChart = dynamic(
  () => import("@/components/admin/dashboard/OrderStatusChart"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
      </div>
    ),
  }
);

const PaymentStatusChart = dynamic(
  () => import("@/components/admin/dashboard/PaymentStatusChart"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
      </div>
    ),
  }
);

const TopProductsChart = dynamic(
  () => import("@/components/admin/dashboard/TopProductsChart"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
      </div>
    ),
  }
);

interface RevenuePoint {
  key: string;
  label: string;
  revenue: number;
}

interface OrderStatus {
  _id: string;
  count: number;
}

interface Product {
  name: string;
  sold: number;
}

interface DashboardChartsProps {
  revenueTrend: RevenuePoint[];
  orderStatusBreakdown: OrderStatus[];
  paymentStatusBreakdown: OrderStatus[];
  topSellingProducts: Product[];
  activePeriod: string;
}

export default function DashboardCharts({
  revenueTrend,
  orderStatusBreakdown,
  paymentStatusBreakdown,
  topSellingProducts,
  activePeriod,
}: DashboardChartsProps) {
  return (
    <>
      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm xl:col-span-2">
          <h2 className="text-lg font-semibold text-neutral-950">Revenue Trend</h2>
          <p className="mt-2 text-sm text-neutral-500">
            {activePeriod === "7d" || activePeriod === "30d"
              ? `Daily revenue — last ${revenueTrend.length} days`
              : `Monthly revenue — last ${revenueTrend.length} months`}{" "}
            from paid orders.
          </p>
          <div className="mt-6">
            <RevenueChart data={revenueTrend} />
          </div>
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-950">Order Status</h2>
          <p className="mt-2 text-sm text-neutral-500">Share of total orders across fulfillment statuses.</p>
          <div className="mt-6">
            <OrderStatusChart data={orderStatusBreakdown} />
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm xl:col-span-2">
          <h2 className="text-lg font-semibold text-neutral-950">Top-Selling Products</h2>
          <p className="mt-2 text-sm text-neutral-500">Ranked by units sold.</p>
          <div className="mt-6">
            <TopProductsChart
              data={topSellingProducts.map((product) => ({ name: product.name, sold: product.sold }))}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-950">Payment Status</h2>
          <p className="mt-2 text-sm text-neutral-500">Overview of successful, pending and failed payments.</p>
          <div className="mt-6">
            <PaymentStatusChart data={paymentStatusBreakdown} />
          </div>
        </section>
      </div>
    </>
  );
}
