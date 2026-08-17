import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Types } from "mongoose";

import LiveOrderInformation from "@/components/orders/LiveOrderInformation";
import LiveOrderStatus from "@/components/orders/LiveOrderStatus";
import InvoiceActions from "@/components/orders/InvoiceActions";
import OrderTimeline from "@/components/orders/OrderTimeline";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import "@/models/Product";
import { resolveUserId } from "@/lib/user";

export const dynamic = "force-dynamic";

interface OrderPageProps {
  params: Promise<{ id: string }>;
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-PK").format(value);
}

function formatPaymentMethod(method: "cod" | "card" | "bank") {
  const labels = {
    cod: "Cash on Delivery",
    card: "Credit / Debit Card",
    bank: "Bank Transfer",
  };

  return labels[method];
}

export default async function OrderPage({ params }: OrderPageProps) {
  const { id } = await params;

  if (!Types.ObjectId.isValid(id)) {
    notFound();
  }

  await connectDB();

  const userId = await resolveUserId();

  const userIdString = userId.toString();

  const order = await Order.findOne({ _id: id, user: userId })
    .populate({ path: "items.product", select: "name brand" })
    .lean();

  if (!order) {
    notFound();
  }

  const invoiceNumber = order.invoiceNumber || `INV-${order.orderNumber}`;

  return (
    <main className="min-h-screen bg-neutral-100 px-4 py-10 sm:px-6 lg:px-8 print:bg-white print:p-0">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 transition hover:text-indigo-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to My Orders
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <LiveOrderStatus
              userId={userIdString}
              orderId={order._id.toString()}
              initialOrderStatus={order.orderStatus}
              initialPaymentStatus={order.paymentStatus}
            />

            <InvoiceActions />
          </div>
        </div>

        <section className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm print:rounded-none print:border-0 print:shadow-none">
          <div className="border-b border-neutral-200 px-8 py-8 sm:px-10">
            <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-indigo-600">NovaCart</h1>
                <p className="mt-2 text-sm text-neutral-500">Premium Marketplace</p>
              </div>

              <div className="text-left sm:text-right">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                  Invoice
                </p>
                <h2 className="mt-2 text-2xl font-bold text-neutral-950">{invoiceNumber}</h2>
                <p className="mt-2 text-sm text-neutral-500">
                  {new Date(order.createdAt).toLocaleDateString("en-PK", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-8 border-b border-neutral-200 px-8 py-8 sm:grid-cols-2 sm:px-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                Bill To
              </p>

              <div className="mt-4 text-sm leading-7 text-neutral-600">
                <p className="font-semibold text-neutral-950">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.address}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                </p>
                <p>{order.shippingAddress.country}</p>
                <p className="mt-3">{order.shippingAddress.phone}</p>
                <p>{order.shippingAddress.email}</p>
              </div>
            </div>

            <div className="sm:text-right">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                Order Information
              </p>

              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-4 sm:justify-end">
                  <span className="text-neutral-500">Order Number</span>
                  <span className="font-semibold text-neutral-950">{order.orderNumber}</span>
                </div>
                <div className="flex justify-between gap-4 sm:justify-end">
                  <span className="text-neutral-500">Tracking Number</span>
                  <span className="font-semibold text-indigo-600">{order.trackingNumber}</span>
                </div>
                <div className="flex justify-between gap-4 sm:justify-end">
                  <span className="text-neutral-500">Payment Method</span>
                  <span className="font-semibold text-neutral-950">
                    {formatPaymentMethod(order.paymentMethod)}
                  </span>
                </div>
                <LiveOrderInformation
                  userId={userIdString}
                  orderId={order._id.toString()}
                  initialOrderStatus={order.orderStatus}
                  initialPaymentStatus={order.paymentStatus}
                />
              </div>
            </div>
          </div>

        <div className="mt-6">
          <OrderTimeline
            currentStatus={order.orderStatus}
            createdAt={order.createdAt}
            paidAt={order.paidAt}
            deliveredAt={order.deliveredAt}
          />
        </div>

          <div className="overflow-x-auto px-8 py-8 sm:px-10">
            <table className="w-full min-w-[620px] border-collapse">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="pb-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    Product
                  </th>
                  <th className="pb-4 text-center text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    Qty
                  </th>
                  <th className="pb-4 text-right text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    Unit Price
                  </th>
                  <th className="pb-4 text-right text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    Total
                  </th>
                </tr>
              </thead>

              <tbody>
                {order.items.map((item, index) => {
                  const product = item.product as unknown as {
                    _id?: { toString(): string };
                    name?: string;
                    brand?: string;
                  };

                  return (
                    <tr
                      key={product?._id?.toString() || `${index}-${item.price}`}
                      className="border-b border-neutral-100 last:border-0"
                    >
                      <td className="py-5">
                        <p className="font-semibold text-neutral-950">
                          {product?.name || "Product unavailable"}
                        </p>
                        <p className="mt-1 text-sm text-neutral-500">{product?.brand || "NovaCart"}</p>
                      </td>
                      <td className="py-5 text-center text-sm text-neutral-700">{item.quantity}</td>
                      <td className="py-5 text-right text-sm text-neutral-700">
                        Rs. {formatPrice(item.price)}
                      </td>
                      <td className="py-5 text-right font-semibold text-neutral-950">
                        Rs. {formatPrice(item.price * item.quantity)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="border-t border-neutral-200 bg-neutral-50 px-8 py-8 sm:px-10">
            <div className="ml-auto max-w-sm space-y-4 text-sm">
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
              <div className="flex justify-between gap-4 text-neutral-600">
                <span>Discount</span>
                <span>- Rs. {formatPrice(order.discount)}</span>
              </div>

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

          <div className="px-8 py-8 text-center sm:px-10">
            <p className="text-sm font-semibold text-neutral-950">Thank you for shopping with NovaCart.</p>
            <p className="mt-2 text-sm text-neutral-500">
              This invoice was generated electronically and does not require a signature.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
