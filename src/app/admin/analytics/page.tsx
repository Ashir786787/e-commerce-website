import Image from "next/image";
import Link from "next/link";
import {
  Boxes,
  CircleDollarSign,
  Clock3,
  FolderTree,
  PackageSearch,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";

import AnalyticsPeriodSelect from "./AnalyticsPeriodSelect";
import OrderStatusBadge from "@/components/orders/OrderStatusBadge";
import {
  getAdminStatistics,
  parsePeriod,
} from "@/services/statistics.service";

export const dynamic = "force-dynamic";

interface AdminAnalyticsPageProps {
  searchParams: Promise<{
    period?: string;
  }>;
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-PK").format(value);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function getStatusCount(
  values: { _id: string; count: number }[],
  status: string
) {
  return (
    values.find((item) => item._id === status)
      ?.count || 0
  );
}

export default async function AdminAnalyticsPage({
  searchParams,
}: AdminAnalyticsPageProps) {
  const { period } = await searchParams;

  const activePeriod = parsePeriod(period);

  const {
    totals,
    orderStatusBreakdown,
    paymentStatusBreakdown,
    revenueTrend,
    recentOrders,
    topSellingProducts,
    lowStockProducts,
  } = await getAdminStatistics(activePeriod);

  const cards = [
    {
      title: "Paid Revenue",
      value: `Rs. ${formatPrice(totals.revenue)}`,
      description: "Revenue from paid orders",
      icon: CircleDollarSign,
    },
    {
      title: "Avg Order Value",
      value: `Rs. ${formatPrice(totals.avgOrderValue)}`,
      description: "Revenue per paid order",
      icon: TrendingUp,
    },
    {
      title: "Pending Revenue",
      value: `Rs. ${formatPrice(totals.pendingRevenue)}`,
      description: "Pending payments incl. COD",
      icon: Clock3,
    },
    {
      title: "Total Orders",
      value: totals.orders.toLocaleString("en-PK"),
      description:
        activePeriod === "all"
          ? "All customer orders"
          : "Orders in selected period",
      icon: ShoppingCart,
    },
  ];

  const orderStatuses = [
    {
      name: "Pending",
      value: getStatusCount(
        orderStatusBreakdown,
        "pending"
      ),
    },
    {
      name: "Confirmed",
      value: getStatusCount(
        orderStatusBreakdown,
        "confirmed"
      ),
    },
    {
      name: "Processing",
      value: getStatusCount(
        orderStatusBreakdown,
        "processing"
      ),
    },
    {
      name: "Shipped",
      value: getStatusCount(
        orderStatusBreakdown,
        "shipped"
      ),
    },
    {
      name: "Delivered",
      value: getStatusCount(
        orderStatusBreakdown,
        "delivered"
      ),
    },
    {
      name: "Cancelled",
      value: getStatusCount(
        orderStatusBreakdown,
        "cancelled"
      ),
    },
  ];

  const paidOrders = getStatusCount(
    paymentStatusBreakdown,
    "paid"
  );

  const pendingPayments = getStatusCount(
    paymentStatusBreakdown,
    "pending"
  );

  const failedPayments = getStatusCount(
    paymentStatusBreakdown,
    "failed"
  );

  const maxRevenue = Math.max(
    ...revenueTrend.map((point) => point.revenue),
    0
  );

  const isDaily =
    activePeriod === "7d" || activePeriod === "30d";

  const labelStep =
    isDaily && revenueTrend.length > 10 ? 5 : 1;

  const trendTitle = isDaily
    ? `Daily revenue — last ${revenueTrend.length} days`
    : `Monthly revenue — last ${revenueTrend.length} months`;

  return (
    <div>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
            Analytics Overview
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">
            Analytics
          </h1>

          <p className="mt-3 text-neutral-600">
            Review NovaCart marketplace performance,
            orders, revenue and inventory.
          </p>
        </div>

        <AnalyticsPeriodSelect period={activePeriod} />
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              key={card.title}
              className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm text-neutral-500">
                    {card.title}
                  </p>

                  <p className="mt-3 break-words text-2xl font-bold text-neutral-950 sm:text-3xl">
                    {card.value}
                  </p>

                  <p className="mt-2 text-sm text-neutral-500">
                    {card.description}
                  </p>
                </div>

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold text-neutral-950">
          Marketplace Totals
        </h2>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-neutral-50 p-4">
            <Users className="h-5 w-5 text-indigo-600" />

            <p className="mt-3 text-sm text-neutral-500">
              Users
            </p>

            <p className="mt-1 text-2xl font-bold text-neutral-950">
              {totals.users}
            </p>
          </div>

          <div className="rounded-xl bg-neutral-50 p-4">
            <Boxes className="h-5 w-5 text-indigo-600" />

            <p className="mt-3 text-sm text-neutral-500">
              Products
            </p>

            <p className="mt-1 text-2xl font-bold text-neutral-950">
              {totals.products}
            </p>
          </div>

          <div className="rounded-xl bg-neutral-50 p-4">
            <FolderTree className="h-5 w-5 text-indigo-600" />

            <p className="mt-3 text-sm text-neutral-500">
              Categories
            </p>

            <p className="mt-1 text-2xl font-bold text-neutral-950">
              {totals.categories}
            </p>
          </div>

          <div className="rounded-xl bg-neutral-50 p-4">
            <ShoppingCart className="h-5 w-5 text-indigo-600" />

            <p className="mt-3 text-sm text-neutral-500">
              Orders
            </p>

            <p className="mt-1 text-2xl font-bold text-neutral-950">
              {totals.orders}
            </p>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-semibold text-neutral-950">
            Order Status Breakdown
          </h2>

          <p className="mt-2 text-sm text-neutral-500">
            Share of total orders across fulfillment
            statuses.
          </p>

          <div className="mt-6 space-y-5">
            {orderStatuses.map((status) => {
              const percentage =
                totals.orders > 0
                  ? (status.value / totals.orders) * 100
                  : 0;

              return (
                <div key={status.name}>
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <p className="text-sm font-medium text-neutral-700">
                      {status.name}
                    </p>

                    <p className="text-sm font-semibold text-neutral-950">
                      {status.value}{" "}
                      <span className="text-neutral-500">
                        ({Math.round(percentage)}%)
                      </span>
                    </p>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
                    <div
                      className="h-full rounded-full bg-indigo-600"
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-semibold text-neutral-950">
            Payment Status
          </h2>

          <p className="mt-2 text-sm text-neutral-500">
            Overview of successful, pending and failed
            payments.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-emerald-50 p-5">
              <p className="text-sm font-medium text-emerald-700">
                Paid
              </p>

              <p className="mt-3 text-3xl font-bold text-emerald-800">
                {paidOrders}
              </p>
            </div>

            <div className="rounded-xl bg-amber-50 p-5">
              <p className="text-sm font-medium text-amber-700">
                Pending
              </p>

              <p className="mt-3 text-3xl font-bold text-amber-800">
                {pendingPayments}
              </p>
            </div>

            <div className="rounded-xl bg-red-50 p-5">
              <p className="text-sm font-medium text-red-700">
                Failed
              </p>

              <p className="mt-3 text-3xl font-bold text-red-800">
                {failedPayments}
              </p>
            </div>
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
        <div>
          <h2 className="text-xl font-semibold text-neutral-950">
            Revenue Trend
          </h2>

          <p className="mt-2 text-sm text-neutral-500">
            {trendTitle} from paid, non-cancelled orders.
          </p>
        </div>

        <div className="mt-8 flex h-48 items-end gap-1 sm:gap-2">
          {revenueTrend.map((point, index) => {
            const height =
              maxRevenue > 0
                ? Math.max(
                    (point.revenue / maxRevenue) * 100,
                    3
                  )
                : 3;

            const showLabel =
              labelStep === 1 || index % labelStep === 0;

            return (
              <div
                key={point.key}
                className="flex h-full flex-1 flex-col items-center"
              >
                <div className="flex w-full flex-1 items-end justify-center">
                  <div
                    title={`${point.label}: Rs. ${formatPrice(
                      point.revenue
                    )}`}
                    className={`w-full max-w-[28px] rounded-t-md ${
                      point.revenue > 0
                        ? "bg-indigo-600"
                        : "bg-neutral-200"
                    }`}
                    style={{
                      height: `${height}%`,
                    }}
                  />
                </div>

                <span className="mt-2 text-[10px] font-medium text-neutral-500">
                  {showLabel ? point.label : ""}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-6 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-neutral-200 px-5 py-5 sm:px-6">
          <div>
            <h2 className="text-xl font-semibold text-neutral-950">
              Recent Orders
            </h2>

            <p className="mt-1 text-sm text-neutral-500">
              Latest customer orders on NovaCart.
            </p>
          </div>

          <Link
            href="/admin/orders"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            View All
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-neutral-500">
            No orders are available yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px]">
              <thead className="bg-neutral-50">
                <tr className="border-b border-neutral-200">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    Order
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    Customer
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    Total
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-200">
                {recentOrders.map((order) => {
                  const customer = order.user;

                  return (
                    <tr
                      key={order._id.toString()}
                      className="hover:bg-neutral-50"
                    >
                      <td className="px-6 py-5">
                        <Link
                          href={`/admin/orders/${order._id.toString()}`}
                          className="font-semibold text-neutral-950 hover:text-indigo-600"
                        >
                          {order.orderNumber}
                        </Link>
                      </td>

                      <td className="px-6 py-5">
                        <p className="font-medium text-neutral-950">
                          {customer?.fullName ||
                            "Unknown user"}
                        </p>

                        <p className="mt-1 text-sm text-neutral-500">
                          {customer?.email || "No email"}
                        </p>
                      </td>

                      <td className="px-6 py-5 font-semibold text-neutral-950">
                        Rs. {formatPrice(order.total)}
                      </td>

                      <td className="px-6 py-5">
                        <OrderStatusBadge
                          status={order.orderStatus}
                        />
                      </td>

                      <td className="px-6 py-5 text-sm text-neutral-600">
                        {formatDate(order.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-indigo-600" />

            <div>
              <h2 className="text-xl font-semibold text-neutral-950">
                Top-Selling Products
              </h2>

              <p className="mt-1 text-sm text-neutral-500">
                Ranked by quantity sold.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {topSellingProducts.length === 0 ? (
              <p className="text-sm text-neutral-500">
                No product sales are available yet.
              </p>
            ) : (
              topSellingProducts.map((product, index) => {
                const image =
                  product.images?.[0]?.url || "";

                return (
                  <div
                    key={product._id.toString()}
                    className="flex items-center gap-4 rounded-xl border border-neutral-200 p-4"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                      {index + 1}
                    </div>

                    {image ? (
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                        <Image
                          src={image}
                          alt={product.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-neutral-100">
                        <PackageSearch className="h-5 w-5 text-neutral-400" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-neutral-950">
                        {product.name}
                      </p>

                      <p className="mt-1 text-sm text-neutral-500">
                        {product.brand}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-indigo-600">
                        {product.sold}
                      </p>

                      <p className="text-xs text-neutral-500">
                        sold
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3">
            <Boxes className="h-5 w-5 text-amber-600" />

            <div>
              <h2 className="text-xl font-semibold text-neutral-950">
                Low-Stock Products
              </h2>

              <p className="mt-1 text-sm text-neutral-500">
                Active products with five or fewer units.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {lowStockProducts.length === 0 ? (
              <div className="rounded-xl bg-emerald-50 p-5 text-sm font-medium text-emerald-700">
                All active products have sufficient
                stock.
              </div>
            ) : (
              lowStockProducts.map((product) => {
                const image =
                  product.images?.[0]?.url || "";

                return (
                  <div
                    key={product._id.toString()}
                    className="flex items-center gap-4 rounded-xl border border-neutral-200 p-4"
                  >
                    {image ? (
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                        <Image
                          src={image}
                          alt={product.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-neutral-100">
                        <PackageSearch className="h-5 w-5 text-neutral-400" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-neutral-950">
                        {product.name}
                      </p>

                      <p className="mt-1 text-sm text-neutral-500">
                        {product.brand}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        product.stock === 0
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {product.stock === 0
                        ? "Out of stock"
                        : `${product.stock} left`}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
