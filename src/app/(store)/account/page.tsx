import Link from "next/link";
import { redirect } from "next/navigation";
import { Heart, Package, Settings, ShoppingCart } from "lucide-react";

import ProfileForm from "@/components/account/ProfileForm";
import UserAvatar from "@/components/account/UserAvatar";
import EnableNotificationsButton from "@/components/notifications/EnableNotificationsButton";
import TestNotificationButton from "@/components/notifications/TestNotificationButton";
import OrderCard from "@/components/orders/OrderCard";
import { connectDB } from "@/lib/db";
import Cart from "@/models/Cart";
import Order from "@/models/Order";
import Wishlist from "@/models/Wishlist";
import { getCurrentUser } from "@/services/auth.service";

export const dynamic = "force-dynamic";

const priceFormatter = new Intl.NumberFormat("en-PK");

export default async function AccountPage() {
  let user;

  try {
    user = await getCurrentUser();
  } catch {
    redirect("/login");
  }

  await connectDB();

  const [orderStats, cart, wishlist, recentOrders] = await Promise.all([
    Order.aggregate<{
      _id: null;
      count: number;
      totalSpent: number;
    }>([
      {
        $match: {
          user: user.id,
          orderStatus: { $ne: "cancelled" },
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          totalSpent: { $sum: "$total" },
        },
      },
    ]),
    Cart.findOne({ user: user.id }).lean(),
    Wishlist.findOne({ user: user.id }).lean(),
    Order.find({ user: user.id }).sort({ createdAt: -1 }).limit(3).lean(),
  ]);

  const stats = orderStats[0] || {
    count: 0,
    totalSpent: 0,
  };

  const cartItemCount = cart?.items.reduce((total, item) => total + item.quantity, 0) || 0;
  const wishlistCount = wishlist?.products.length || 0;

  const memberSince = new Date(user.createdAt).toLocaleDateString("en-PK", {
    year: "numeric",
    month: "long",
  });

  const summaryStats = [
    {
      label: "Orders Placed",
      value: String(stats.count),
      icon: Package,
    },
    {
      label: "Total Spent",
      value: `Rs. ${priceFormatter.format(stats.totalSpent)}`,
      icon: ShoppingCart,
    },
    {
      label: "Cart Items",
      value: String(cartItemCount),
      icon: ShoppingCart,
    },
    {
      label: "Wishlist Items",
      value: String(wishlistCount),
      icon: Heart,
    },
  ];

  return (
    <main className="flex-1">
        <section className="border-b bg-background">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              Account
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight">
              My Profile
            </h1>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              View your profile summary, recent orders and account details.
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-6 rounded-2xl border bg-background p-6 sm:flex-row sm:items-center sm:p-8">
              <UserAvatar
                name={user.fullName}
                avatar={user.avatar}
                className="h-20 w-20 text-2xl"
              />

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-bold">{user.fullName}</h2>
                  {user.isVerified && (
                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                      Verified
                    </span>
                  )}
                </div>
                <p className="mt-1 text-muted-foreground">{user.email}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Member since {memberSince}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <EnableNotificationsButton />
                  <TestNotificationButton />
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              <section className="rounded-2xl border bg-background p-6 sm:p-8 lg:col-span-2">
                <h2 className="text-xl font-semibold">
                  Personal Information
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Update your name and profile photo.
                </p>

                <div className="mt-6">
                  <ProfileForm
                    user={{
                      fullName: user.fullName,
                      email: user.email,
                      avatar: user.avatar || "",
                    }}
                  />
                </div>
              </section>

              <aside className="space-y-6">
                <div className="rounded-2xl border bg-background p-6">
                  <h2 className="text-lg font-semibold">Quick Links</h2>

                  <div className="mt-4 space-y-2">
                    <Link
                      href="/account/orders"
                      className="flex items-center gap-3 rounded-xl border border-neutral-200 px-4 py-3 text-sm font-medium text-neutral-700 transition hover:border-indigo-300 hover:text-indigo-600"
                    >
                      <Package className="h-4 w-4" />
                      My Orders
                    </Link>

                    <Link
                      href="/account/settings"
                      className="flex items-center gap-3 rounded-xl border border-neutral-200 px-4 py-3 text-sm font-medium text-neutral-700 transition hover:border-indigo-300 hover:text-indigo-600"
                    >
                      <Settings className="h-4 w-4" />
                      Account Settings
                    </Link>

                    <Link
                      href="/wishlist"
                      className="flex items-center gap-3 rounded-xl border border-neutral-200 px-4 py-3 text-sm font-medium text-neutral-700 transition hover:border-indigo-300 hover:text-indigo-600"
                    >
                      <Heart className="h-4 w-4" />
                      Wishlist
                    </Link>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {summaryStats.map((stat) => {
                    const Icon = stat.icon;

                    return (
                      <div
                        key={stat.label}
                        className="rounded-2xl border bg-background p-4"
                      >
                        <Icon className="h-4 w-4 text-primary" />
                        <p className="mt-3 text-lg font-bold">{stat.value}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {stat.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </aside>
            </div>

            <div className="mt-10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Recent Orders</h2>
                <Link
                  href="/account/orders"
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  View all
                </Link>
              </div>

              {recentOrders.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-14 text-center">
                  <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-indigo-50">
                    <Package className="h-7 w-7 text-indigo-400" />
                  </div>
                  <h3 className="mt-5 text-xl font-bold text-neutral-900">No Orders Yet</h3>
                  <p className="mx-auto mt-2 max-w-sm text-sm text-neutral-500">
                    Your order history will appear here once you make your first purchase.
                  </p>
                </div>
              ) : (
                <div className="mt-6 space-y-6">
                  {recentOrders.map((order) => (
                    <OrderCard
                      key={order._id.toString()}
                      order={{
                        _id: order._id.toString(),
                        orderNumber: order.orderNumber || `NC-${order._id.toString().slice(-6).toUpperCase()}`,
                        createdAt: order.createdAt.toISOString(),
                        total: order.total,
                        paymentMethod: order.paymentMethod,
                        paymentStatus: order.paymentStatus,
                        orderStatus: order.orderStatus,
                        items: order.items,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
  );
}
