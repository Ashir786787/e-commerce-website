import Link from "next/link";
import { Package, ShoppingBag } from "lucide-react";
import OrderCard from "@/components/orders/OrderCard";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { resolveUserId } from "@/lib/user";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  await connectDB();

  const userId = await resolveUserId();

  const orders = await Order.find({ user: userId })
    .sort({ createdAt: -1 })
    .lean();

  return (
    <main className="flex-1">
        <section className="border-b bg-background">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Account</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight">My Orders</h1>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              Track your recent purchases and view the status of every order.
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {orders.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-20 text-center">
                <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-indigo-50">
                  <Package className="h-9 w-9 text-indigo-400" />
                </div>
                <h2 className="mt-6 text-2xl font-bold text-neutral-900">No Orders Yet</h2>
                <p className="mx-auto mt-3 max-w-sm text-sm text-neutral-500">
                  Once you place your first order, it will appear here so you can track it.
                </p>
                <Link
                  href="/products"
                  className="mt-7 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-7 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
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
        </section>
      </main>
  );
}
