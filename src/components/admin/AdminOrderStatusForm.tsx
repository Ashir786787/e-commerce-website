"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { toast } from "sonner";

type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

type PaymentStatus = "pending" | "paid" | "failed";

interface AdminOrderStatusFormProps {
  orderId: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
}

export default function AdminOrderStatusForm({
  orderId,
  orderStatus: initialOrderStatus,
  paymentStatus: initialPaymentStatus,
}: AdminOrderStatusFormProps) {
  const router = useRouter();

  const [orderStatus, setOrderStatus] = useState<OrderStatus>(initialOrderStatus);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(initialPaymentStatus);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setIsSaving(true);

      const response = await fetch(
        `/api/admin/orders/${orderId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            orderStatus,
            paymentStatus,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to update order."
        );
      }

      toast.success("Order updated successfully.");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update order."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <h2 className="text-xl font-semibold text-neutral-950">
        Order Controls
      </h2>

      <p className="mt-2 text-sm text-neutral-500">
        Update fulfillment and payment information.
      </p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="orderStatus"
            className="mb-2 block text-sm font-medium text-neutral-800"
          >
            Order Status
          </label>

          <select
            id="orderStatus"
            value={orderStatus}
            onChange={(event) => setOrderStatus(event.target.value as OrderStatus)}
            className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
          >
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="paymentStatus"
            className="mb-2 block text-sm font-medium text-neutral-800"
          >
            Payment Status
          </label>

          <select
            id="paymentStatus"
            value={paymentStatus}
            onChange={(event) => setPaymentStatus(event.target.value as PaymentStatus)}
            className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
          >
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSaving}
        className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        <Save className="h-4 w-4" />
        {isSaving ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
