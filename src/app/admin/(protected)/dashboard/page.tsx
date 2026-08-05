import {
  Boxes,
  CircleDollarSign,
  FolderTree,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";

import AnalyticsPeriodSelect from "../analytics/AnalyticsPeriodSelect";
import OrderStatusChart from "@/components/admin/dashboard/OrderStatusChart";
import PaymentStatusChart from "@/components/admin/dashboard/PaymentStatusChart";
import RevenueChart from "@/components/admin/dashboard/RevenueChart";
import TopProductsChart from "@/components/admin/dashboard/TopProductsChart";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { getAdminStatistics, parsePeriod } from "@/services/statistics.service";

export const dynamic = "force-dynamic";

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-PK").format(value);
}

interface AdminDashboardPageProps {
  searchParams: Promise<{
    period?: string;
  }>;
}

export default async function AdminDashboardPage({ searchParams }: AdminDashboardPageProps) {
  const { period } = await searchParams;
  const activePeriod = parsePeriod(period);

  const { totals, orderStatusBreakdown, paymentStatusBreakdown, revenueTrend, topSellingProducts } =
    await getAdminStatistics(activePeriod);

  await connectDB();

  const [totalProducts, totalOrders, revenueResult] = await Promise.all([
    Product.countDocuments({ isActive: true }),
    Order.countDocuments(),
    Order.aggregate<{ _id: null; totalRevenue: number }>([
      { $match: { paymentStatus: "paid", orderStatus: { $ne: "cancelled" } } },
      { $group: { _id: null, totalRevenue: { $sum: "$total" } } },
    ]),
  ]);

  const allTimeRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

  const cards = [
    {
      title: "Paid Revenue",
      value: `Rs. ${formatPrice(totals.revenue)}`,
      description: activePeriod === "all" ? "Revenue from paid orders" : "Paid revenue in selected period",
      icon: CircleDollarSign,
      iconBg: "bg-emerald-50 text-emerald-600",
      accent: "from-emerald-500 to-teal-400",
    },
    {
      title: "Total Orders",
      value: totals.orders.toLocaleString("en-PK"),
      description: activePeriod === "all" ? "All customer orders" : "Orders in selected period",
      icon: ShoppingCart,
      iconBg: "bg-indigo-50 text-indigo-600",
      accent: "from-indigo-500 to-violet-400",
    },
    {
      title: "Avg Order Value",
      value: `Rs. ${formatPrice(totals.avgOrderValue)}`,
      description: "Revenue per paid order",
      icon: TrendingUp,
      iconBg: "bg-amber-50 text-amber-600",
      accent: "from-amber-500 to-orange-400",
    },
    {
      title: "Total Users",
      value: totals.users.toLocaleString("en-PK"),
      description: "Registered customers",
      icon: Users,
      iconBg: "bg-sky-50 text-sky-600",
      accent: "from-sky-500 to-cyan-400",
    },
  ];

  const marketplaceStats = [
    { label: "Users", value: totals.users, icon: Users, iconBg: "bg-sky-50 text-sky-600" },
    { label: "Active Products", value: totalProducts, icon: Boxes, iconBg: "bg-indigo-50 text-indigo-600" },
    { label: "Orders", value: totalOrders, icon: ShoppingCart, iconBg: "bg-violet-50 text-violet-600" },
    { label: "Categories", value: totals.categories, icon: FolderTree, iconBg: "bg-amber-50 text-amber-600" },
  ];

  return (
    <div>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Overview</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-950 sm:text-3xl">Admin Dashboard</h1>
          <p className="mt-1.5 text-neutral-600">Monitor NovaCart activity and manage the marketplace.</p>
        </div>

        <AnalyticsPeriodSelect period={activePeriod} basePath="/admin/dashboard" />
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              key={card.title}
              className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${card.accent}`} />

              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-neutral-500">{card.title}</p>
                  <p className="mt-2 break-words text-lg font-bold tracking-tight text-neutral-950 sm:text-xl">
                    {card.value}
                  </p>
                  <p className="mt-1.5 text-sm text-neutral-500">{card.description}</p>
                </div>

                <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${card.iconBg}`}>
                  <Icon className="h-6 w-6" />
                </span>
              </div>
            </article>
          );
        })}
      </div>

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

      <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-neutral-950">Marketplace Overview</h2>
        <p className="mt-2 text-sm text-neutral-500">
          These statistics are loaded directly from MongoDB and update whenever users, products, orders, or paid
          revenue change.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {marketplaceStats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div key={stat.label} className="rounded-2xl border border-neutral-100 bg-neutral-50/70 p-5">
                <div className="flex items-center gap-2.5">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${stat.iconBg}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <p className="text-sm font-medium text-neutral-500">{stat.label}</p>
                </div>

                <p className="mt-3 text-lg font-bold tracking-tight text-neutral-950">
                  {stat.value.toLocaleString("en-PK")}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-between gap-4 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-6 shadow-lg shadow-indigo-600/20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/70">All-Time Paid Revenue</p>
            <p className="mt-2 text-lg font-bold tracking-tight text-white sm:text-xl">
              Rs. {formatPrice(allTimeRevenue)}
            </p>
          </div>

          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white">
            <TrendingUp className="h-6 w-6" />
          </span>
        </div>
      </div>
    </div>
  );
}
