import Link from "next/link";
import { Types } from "mongoose";
import { Search, ShoppingCart } from "lucide-react";

import { connectDB } from "@/lib/db";
import Order from "@/models/Order";

export const dynamic = "force-dynamic";

interface AdminOrderRow {
  _id: Types.ObjectId;
  orderNumber: string;
  total: number;
  paymentMethod: "cod" | "card" | "bank";
  paymentStatus: "pending" | "paid" | "failed";
  orderStatus:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  user: { fullName?: string; email?: string } | null;
}

interface OrdersPageProps {
  searchParams: Promise<{
    search?: string;
    orderStatus?: string;
    paymentStatus?: string;
    paymentMethod?: string;
  }>;
}

export default async function AdminOrdersPage({
  searchParams,
}: OrdersPageProps) {
  await connectDB();

  const params = await searchParams;

  const search = params.search ?? "";
  const orderStatus = params.orderStatus ?? "";
  const paymentStatus = params.paymentStatus ?? "";
  const paymentMethod = params.paymentMethod ?? "";

  const query: Record<string, unknown> = {};

  if (orderStatus) query.orderStatus = orderStatus;
  if (paymentStatus) query.paymentStatus = paymentStatus;
  if (paymentMethod) query.paymentMethod = paymentMethod;

  let orders = (await Order.find(query)
    .populate("user", "fullName email")
    .sort({ createdAt: -1 })
    .lean()) as AdminOrderRow[];

  if (search) {
    const term = search.toLowerCase();

    orders = orders.filter((order) => {
      const user = order.user;
      return (
        order.orderNumber.toLowerCase().includes(term) ||
        user?.fullName?.toLowerCase().includes(term) ||
        user?.email?.toLowerCase().includes(term)
      );
    });
  }

  return (
    <div>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
            Order Management
          </p>
          <h1 className="mt-3 text-4xl font-bold">Orders</h1>
          <p className="mt-3 text-neutral-500">Manage all customer orders.</p>
        </div>
      </div>

      <form className="mt-8 grid gap-4 rounded-2xl border bg-white p-5 lg:grid-cols-4">
        <div className="relative lg:col-span-2">
          <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
          <input
            name="search"
            defaultValue={search}
            placeholder="Search orders..."
            className="h-11 w-full rounded-xl border pl-10 pr-4"
          />
        </div>
        <select
          name="orderStatus"
          defaultValue={orderStatus}
          className="h-11 rounded-xl border px-4"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button className="rounded-xl bg-indigo-600 text-white">
          Search
        </button>
      </form>

      <div className="mt-8 overflow-hidden rounded-2xl border bg-white">
        {orders.length === 0 ? (
          <div className="px-6 py-20 text-center">
            <ShoppingCart className="mx-auto h-12 w-12 text-neutral-300" />
            <h2 className="mt-4 text-xl font-semibold">No Orders Found</h2>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead className="bg-neutral-100">
                <tr>
                  <th className="px-6 py-4 text-left">Order</th>
                  <th className="px-6 py-4 text-left">Customer</th>
                  <th className="px-6 py-4 text-left">Payment</th>
                  <th className="px-6 py-4 text-left">Status</th>
                  <th className="px-6 py-4 text-left">Total</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id.toString()} className="border-t">
                    <td className="px-6 py-5">{order.orderNumber}</td>
                    <td className="px-6 py-5">
                      <div>
                        <p className="font-medium">{order.user?.fullName}</p>
                        <p className="text-sm text-neutral-500">{order.user?.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5 capitalize">{order.paymentStatus}</td>
                    <td className="px-6 py-5 capitalize">{order.orderStatus}</td>
                    <td className="px-6 py-5">Rs. {order.total.toLocaleString()}</td>
                    <td className="px-6 py-5 text-right">
                      <Link
                        href={`/admin/orders/${order._id}`}
                        className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-neutral-50"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
