"use client";

import { useEffect, useState } from "react";

import { subscribeToOrderUpdate } from "@/services/order-realtime.client";
import type {
  RealtimeOrderStatus,
  RealtimePaymentStatus,
} from "@/services/order-realtime.server";

interface LiveOrderInformationProps {
  userId: string;
  orderId: string;
  initialOrderStatus: RealtimeOrderStatus;
  initialPaymentStatus: RealtimePaymentStatus;
}

export default function LiveOrderInformation({
  userId,
  orderId,
  initialOrderStatus,
  initialPaymentStatus,
}: LiveOrderInformationProps) {
  const [orderStatus, setOrderStatus] = useState(initialOrderStatus);
  const [paymentStatus, setPaymentStatus] = useState(initialPaymentStatus);

  useEffect(() => {
    return subscribeToOrderUpdate(
      userId,
      orderId,
      (update) => {
        if (!update) return;

        setOrderStatus(update.orderStatus);
        setPaymentStatus(update.paymentStatus);
      }
    );
  }, [orderId, userId]);

  return (
    <>
      <div className="flex justify-between gap-4 sm:justify-end">
        <span className="text-neutral-500">
          Payment Status
        </span>

        <span className="font-semibold capitalize text-neutral-950">
          {paymentStatus}
        </span>
      </div>

      <div className="flex justify-between gap-4 sm:justify-end">
        <span className="text-neutral-500">
          Order Status
        </span>

        <span className="font-semibold capitalize text-neutral-950">
          {orderStatus}
        </span>
      </div>
    </>
  );
}
