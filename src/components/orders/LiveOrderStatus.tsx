
"use client";

import { useEffect, useState } from "react";
import { Wifi } from "lucide-react";
import { toast } from "sonner";

import OrderStatusBadge from "@/components/orders/OrderStatusBadge";
import { subscribeToOrderUpdate } from "@/services/order-realtime.client";
import type {
  RealtimeOrderStatus,
  RealtimePaymentStatus,
} from "@/services/order-realtime.server";

interface LiveOrderStatusProps {
  userId: string;
  orderId: string;
  initialOrderStatus: RealtimeOrderStatus;
  initialPaymentStatus: RealtimePaymentStatus;
}

export default function LiveOrderStatus({
  userId,
  orderId,
  initialOrderStatus,
  initialPaymentStatus,
}: LiveOrderStatusProps) {
  const [orderStatus, setOrderStatus] = useState<RealtimeOrderStatus>(initialOrderStatus);
  const [paymentStatus, setPaymentStatus] = useState<RealtimePaymentStatus>(initialPaymentStatus);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToOrderUpdate(
      userId,
      orderId,
      (update) => {
        setIsConnected(true);

        if (!update) {
          return;
        }

        setOrderStatus((currentStatus) => {
          if (
            currentStatus !== update.orderStatus
          ) {
            toast.success(
              `Order status updated to ${update.orderStatus}.`
            );
          }

          return update.orderStatus;
        });

        setPaymentStatus(
          update.paymentStatus
        );
      }
    );

    return unsubscribe;
  }, [orderId, userId]);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <OrderStatusBadge status={orderStatus} />

      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold capitalize ${
          paymentStatus === "paid"
            ? "bg-emerald-100 text-emerald-700"
            : paymentStatus === "failed"
              ? "bg-red-100 text-red-700"
              : "bg-amber-100 text-amber-700"
        }`}
      >
        Payment: {paymentStatus}
      </span>

      <span
        className={`hidden items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium sm:inline-flex ${
          isConnected
            ? "bg-blue-50 text-blue-700"
            : "bg-neutral-100 text-neutral-500"
        }`}
      >
        <Wifi className="h-3.5 w-3.5" />

        {isConnected
          ? "Live updates"
          : "Connecting..."}
      </span>
    </div>
  );
}