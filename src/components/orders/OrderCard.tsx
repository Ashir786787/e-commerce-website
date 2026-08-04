import Link from "next/link";
import OrderStatusBadge from "./OrderStatusBadge";

type OrderCardProps = {
  order: {
    _id: string;
    orderNumber: string;
    createdAt: string;
    total: number;
    paymentMethod: "cod" | "card" | "bank";
    paymentStatus: "pending" | "paid" | "failed";
    orderStatus: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
    items: { quantity: number }[];
  };
};

export default function OrderCard({ order }: OrderCardProps) {
  const totalItems = order.items.reduce((total, item) => total + item.quantity, 0);

  return (
    <article className="rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Order</p>
          <h2 className="mt-1 text-xl font-bold">{order.orderNumber}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {new Date(order.createdAt).toLocaleDateString("en-PK", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        <OrderStatusBadge status={order.orderStatus} />
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Payment</p>
          <p className="mt-1 font-medium capitalize">{order.paymentMethod}</p>
          <p className="text-sm capitalize text-muted-foreground">{order.paymentStatus}</p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Items</p>
          <p className="mt-1 font-medium">
            {totalItems} {totalItems === 1 ? "Product" : "Products"}
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Total</p>
          <p className="mt-1 text-lg font-bold text-primary">Rs. {order.total.toLocaleString()}</p>
        </div>
      </div>

      <div className="mt-8">
        <Link
          href={`/orders/${order._id}`}
          className="inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          View Details
        </Link>
      </div>
    </article>
  );
}
