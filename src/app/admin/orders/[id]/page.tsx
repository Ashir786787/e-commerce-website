import Link from "next/link";
import { Types } from "mongoose";
import {
  ArrowLeft,
  Banknote,
  CalendarDays,
  CreditCard,
  MapPin,
  Package,
  Tag,
  UserRound,
} from "lucide-react";
import { notFound, redirect } from "next/navigation";

import AdminOrderStatusForm from "@/components/admin/AdminOrderStatusForm";
import OrderStatusBadge from "@/components/orders/OrderStatusBadge";
import { connectDB } from "@/lib/db";
import Order, { IShippingAddress } from "@/models/Order";
import "@/models/Product";
import { getCurrentUser } from "@/services/auth.service";

export const dynamic = "force-dynamic";

interface AdminOrderDetailsPageProps {
  params: Promise<{ id: string }>;
}

interface PopulatedProduct {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  brand: string;
}

interface AdminOrderRow {
  _id: Types.ObjectId;
  orderNumber: string;
  invoiceNumber?: string;
  user: {
    _id: Types.ObjectId;
    fullName: string;
    email: string;
  } | null;
  items: {
    product?: PopulatedProduct | null;
    quantity: number;
    price: number;
  }[];
  shippingAddress: IShippingAddress;
  paymentMethod: "cod" | "card" | "bank";
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  total: number;
  orderStatus:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  paymentStatus: "pending" | "paid" | "failed";
  discountCode?: string;
  discountPercent?: number;
  paidAt?: Date;
  deliveredAt?: Date;
  createdAt: Date;
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-PK").format(value);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-PK", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("en-PK", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatPaymentMethod(method: "cod" | "card" | "bank") {
  const labels = {
    cod: "Cash on Delivery",
    card: "Credit / Debit Card",
    bank: "Bank Transfer",
  };

  return labels[method];
}

const paymentStatusStyles: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  paid: "bg-emerald-100 text-emerald-700",
  failed: "bg-red-100 text-red-700",
};

export default async function AdminOrderDetailsPage({
  params,
}: AdminOrderDetailsPageProps) {
  const { id } = await params;

  await connectDB();

  const currentAdmin = await getCurrentUser();

  if (!currentAdmin) {
    redirect("/login");
  }

  if (currentAdmin.role !== "admin") {
    redirect("/");
  }

  const order = (await Order.findById(id)
    .populate({
      path: "user",
      select: "fullName email",
    })
    .populate({
      path: "items.product",
      select: "name slug brand",
    })
    .lean()) as AdminOrderRow | null;

  if (!order) {
    notFound();
  }

  return (
    <div>
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 transition hover:text-indigo-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Orders
      </Link>

      <div className="mt-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
          Order Management
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-950 sm:text-3xl">
          Order Details
        </h1>
        <p className="mt-1.5 text-neutral-600">Review and manage this customer order.</p>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-neutral-950">
                  {order.orderNumber}
                </h2>
                <p className="mt-2 text-sm text-neutral-500">
                  Placed on {formatDateTime(order.createdAt)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <OrderStatusBadge status={order.orderStatus} />
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${paymentStatusStyles[order.paymentStatus]}`}
                >
                  {order.paymentStatus}
                </span>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl bg-neutral-50 p-4">
                <div className="flex items-center gap-2 text-neutral-500">
                  <UserRound className="h-4 w-4" />
                  <p className="text-xs font-semibold uppercase tracking-wide">
                    Customer
                  </p>
                </div>
                <p className="mt-3 text-sm font-semibold text-neutral-950">
                  {order.user?.fullName || "Guest"}
                </p>
                <p className="mt-1 break-all text-sm text-neutral-500">
                  {order.user?.email || "No account"}
                </p>
              </div>
              <div className="rounded-xl bg-neutral-50 p-4">
                <div className="flex items-center gap-2 text-neutral-500">
                  <CreditCard className="h-4 w-4" />
                  <p className="text-xs font-semibold uppercase tracking-wide">
                    Payment Method
                  </p>
                </div>
                <p className="mt-3 text-sm font-semibold text-neutral-950">
                  {formatPaymentMethod(order.paymentMethod)}
                </p>
              </div>
              <div className="rounded-xl bg-neutral-50 p-4">
                <div className="flex items-center gap-2 text-neutral-500">
                  <Package className="h-4 w-4" />
                  <p className="text-xs font-semibold uppercase tracking-wide">
                    Items
                  </p>
                </div>
                <p className="mt-3 text-sm font-semibold text-neutral-950">
                  {order.items.reduce(
                    (total, item) => total + item.quantity,
                    0
                  )}{" "}
                  units
                </p>
              </div>
              <div className="rounded-xl bg-neutral-50 p-4">
                <div className="flex items-center gap-2 text-neutral-500">
                  <CalendarDays className="h-4 w-4" />
                  <p className="text-xs font-semibold uppercase tracking-wide">
                    Delivered
                  </p>
                </div>
                <p className="mt-3 text-sm font-semibold text-neutral-950">
                  {order.deliveredAt ? formatDate(order.deliveredAt) : "Not yet"}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-indigo-600" />
              <div>
                <h2 className="text-xl font-semibold text-neutral-950">
                  Shipping Address
                </h2>
                <p className="mt-1 text-sm text-neutral-500">
                  Delivery destination for this order.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-neutral-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Recipient
                </p>
                <p className="mt-3 text-sm font-semibold text-neutral-950">
                  {order.shippingAddress.fullName}
                </p>
                <p className="mt-1 break-all text-sm text-neutral-500">
                  {order.shippingAddress.email}
                </p>
                <p className="mt-1 text-sm text-neutral-500">{order.shippingAddress.phone}</p>
              </div>
              <div className="rounded-xl bg-neutral-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Address
                </p>
                <p className="mt-3 text-sm font-semibold text-neutral-950">
                  {order.shippingAddress.address}
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  {order.shippingAddress.city},{" "}
                  {order.shippingAddress.postalCode}
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  {order.shippingAddress.country}
                </p>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
            <div className="p-5 sm:p-6">
              <h2 className="text-xl font-semibold text-neutral-950">Order Items</h2>
              <p className="mt-1 text-sm text-neutral-500">Products in this order.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead className="bg-neutral-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
                      Product
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-neutral-500">
                      Qty
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-neutral-500">
                      Unit Price
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-neutral-500">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, index) => {
                    const product = item.product;

                    return (
                      <tr
                        key={product?._id?.toString() || `${index}-${item.price}`}
                        className="border-t"
                      >
                        <td className="px-6 py-5">
                          <p className="font-semibold text-neutral-950">
                            {product?.name || "Product unavailable"}
                          </p>
                          <p className="mt-1 text-sm text-neutral-500">
                            {product?.brand || "NovaCart"}
                          </p>
                        </td>
                        <td className="px-6 py-5 text-center text-sm text-neutral-700">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-5 text-right text-sm text-neutral-700">
                          Rs. {formatPrice(item.price)}
                        </td>
                        <td className="px-6 py-5 text-right font-semibold text-neutral-950">
                          Rs.{" "}
                          {formatPrice(item.price * item.quantity)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="border-t border-neutral-200 bg-neutral-50 px-6 py-6 sm:px-8">
              <div className="ml-auto max-w-sm space-y-3 text-sm">
                <div className="flex justify-between gap-4 text-neutral-600">
                  <span>Subtotal</span>
                  <span>Rs. {formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between gap-4 text-neutral-600">
                  <span>Delivery</span>
                  <span>Rs. {formatPrice(order.deliveryFee)}</span>
                </div>
                <div className="flex justify-between gap-4 text-neutral-600">
                  <span>Tax</span>
                  <span>Rs. {formatPrice(order.tax)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between gap-4 text-emerald-600">
                    <span>Discount</span>
                    <span>- Rs. {formatPrice(order.discount)}</span>
                  </div>
                )}
                <div className="border-t border-neutral-300 pt-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-base font-semibold text-neutral-950">Grand Total</span>
                    <span className="text-2xl font-bold text-indigo-600">
                      Rs. {formatPrice(order.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <AdminOrderStatusForm
            orderId={order._id.toString()}
            orderStatus={order.orderStatus}
            paymentStatus={order.paymentStatus}
          />

          <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3">
              <Banknote className="h-5 w-5 text-indigo-600" />
              <div>
                <h2 className="text-xl font-semibold text-neutral-950">
                  Payment & Fulfillment
                </h2>
                <p className="mt-1 text-sm text-neutral-500">Payment and delivery timeline.</p>
              </div>
            </div>

            <div className="mt-6 space-y-4 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-neutral-500">Paid At</span>
                <span className="font-semibold text-neutral-950">
                  {order.paidAt ? formatDateTime(order.paidAt) : "Not paid"}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-neutral-500">Delivered At</span>
                <span className="font-semibold text-neutral-950">
                  {order.deliveredAt ? formatDateTime(order.deliveredAt) : "Not delivered"}
                </span>
              </div>
              {order.discountCode && (
                <div className="rounded-xl bg-neutral-50 p-4">
                  <div className="flex items-center gap-2 text-neutral-500">
                    <Tag className="h-4 w-4" />
                    <p className="text-xs font-semibold uppercase tracking-wide">
                      Discount Code
                    </p>
                  </div>
                  <p className="mt-3 text-sm font-bold uppercase text-neutral-950">
                    {order.discountCode}
                  </p>
                  {order.discountPercent && (
                    <p className="mt-1 text-sm text-neutral-500">
                      {order.discountPercent}% off subtotal
                    </p>
                  )}
                </div>
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
