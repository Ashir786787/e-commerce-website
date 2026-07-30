import {
  Boxes,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";

import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Product from "@/models/Product";
import Order from "@/models/Order";

export const dynamic = "force-dynamic";

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-PK").format(value);
}

export default async function AdminDashboardPage() {
  await connectDB();

  const [
    totalUsers,
    totalProducts,
    totalOrders,
    revenueResult,
  ] = await Promise.all([
    User.countDocuments(),
    Product.countDocuments({
      isActive: true,
    }),
    Order.countDocuments(),
    Order.aggregate([
      {
        $match: {
          paymentStatus: "paid",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: "$total",
          },
        },
      },
    ]),
  ]);

  const totalRevenue =
    revenueResult.length > 0
      ? revenueResult[0].totalRevenue
      : 0;

  const cards = [
    {
      title: "Total Users",
      value: totalUsers.toLocaleString("en-PK"),
      description: "Registered customers",
      icon: Users,
    },
    {
      title: "Total Products",
      value: totalProducts.toLocaleString("en-PK"),
      description: "Active catalogue items",
      icon: Boxes,
    },
    {
      title: "Total Orders",
      value: totalOrders.toLocaleString("en-PK"),
      description: "All customer orders",
      icon: ShoppingCart,
    },
    {
      title: "Total Revenue",
      value: `Rs. ${formatPrice(totalRevenue)}`,
      description: "Completed payments",
      icon: TrendingUp,
    },
  ];

  return (
    <div>
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
          Overview
        </p>

        <h1 className="mt-3 text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">
          Admin Dashboard
        </h1>

        <p className="mt-3 text-neutral-600">
          Monitor NovaCart activity and manage the marketplace.
        </p>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              key={card.title}
              className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-neutral-500">
                    {card.title}
                  </p>

                  <p className="mt-3 text-3xl font-bold text-neutral-950">
                    {card.value}
                  </p>

                  <p className="mt-2 text-sm text-neutral-500">
                    {card.description}
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-neutral-950">
          Marketplace Overview
        </h2>

        <p className="mt-2 text-sm text-neutral-500">
          These statistics are loaded directly from MongoDB and update whenever
          users, products, orders, or paid revenue change.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-neutral-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Users
            </p>
            <p className="mt-2 text-lg font-bold text-neutral-950">
              {totalUsers.toLocaleString("en-PK")}
            </p>
          </div>

          <div className="rounded-xl bg-neutral-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Active Products
            </p>
            <p className="mt-2 text-lg font-bold text-neutral-950">
              {totalProducts.toLocaleString("en-PK")}
            </p>
          </div>

          <div className="rounded-xl bg-neutral-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Orders
            </p>
            <p className="mt-2 text-lg font-bold text-neutral-950">
              {totalOrders.toLocaleString("en-PK")}
            </p>
          </div>

          <div className="rounded-xl bg-neutral-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Paid Revenue
            </p>
            <p className="mt-2 text-lg font-bold text-indigo-600">
              Rs. {formatPrice(totalRevenue)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}