import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";
import OrderCard from "@/components/orders/OrderCard";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { resolveUserId } from "@/lib/user";

export const dynamic = "force-dynamic";

export default async function AccountOrdersPage() {
  await connectDB();

  const userId = await resolveUserId();

  const orders = await Order.find({
    user: userId,
  })
    .sort({
      createdAt: -1,
    })
    .lean();

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <SiteHeader />

      <main className="flex-1">
        <section className="border-b bg-background">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              Account
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-tight">
              My Orders
            </h1>

            <p className="mt-4 max-w-2xl text-muted-foreground">
              Track your recent purchases and view the
              status of every order.
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

            {orders.length === 0 ? (
              <div className="rounded-2xl border border-dashed bg-background px-6 py-16 text-center">
                <h2 className="text-2xl font-semibold">
                  No Orders Yet
                </h2>

                <p className="mt-3 text-muted-foreground">
                  Once you place your first order,
                  it will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <OrderCard
                    key={order._id.toString()}
                    order={{
                      _id: order._id.toString(),
                      orderNumber:
                        order.orderNumber ||
                        `NC-${order._id
                          .toString()
                          .slice(-6)
                          .toUpperCase()}`,
                      createdAt:
                        order.createdAt.toISOString(),
                      total: order.total,
                      paymentMethod:
                        order.paymentMethod,
                      paymentStatus:
                        order.paymentStatus,
                      orderStatus:
                        order.orderStatus,
                      items: order.items,
                    }}
                  />
                ))}
              </div>
            )}

          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
