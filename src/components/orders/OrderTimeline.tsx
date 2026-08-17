import { Check, Circle, X } from "lucide-react";

type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

interface OrderTimelineProps {
  currentStatus: OrderStatus;
  createdAt: string | Date;
  paidAt?: string | Date | null;
  deliveredAt?: string | Date | null;
}

const steps: { key: OrderStatus; label: string }[] = [
  { key: "pending", label: "Order Placed" },
  { key: "confirmed", label: "Confirmed" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
];

const statusIndex: Record<OrderStatus, number> = {
  pending: 0,
  confirmed: 1,
  processing: 2,
  shipped: 3,
  delivered: 4,
  cancelled: 0,
};

function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-PK", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function OrderTimeline({
  currentStatus,
  createdAt,
  paidAt,
  deliveredAt,
}: OrderTimelineProps) {
  if (currentStatus === "cancelled") {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
            <X className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <p className="font-semibold text-red-900">Order Cancelled</p>
            <p className="text-sm text-red-600">
              This order has been cancelled.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentIdx = statusIndex[currentStatus];
  const timestamps: Record<string, string> = {
    pending: formatDate(createdAt),
    confirmed: formatDate(paidAt),
    processing: "",
    shipped: "",
    delivered: formatDate(deliveredAt),
  };

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <h3 className="mb-6 text-sm font-semibold uppercase tracking-wide text-neutral-500">
        Order Progress
      </h3>
      <div className="relative">
        {steps.map((step, i) => {
          const isCompleted = i <= currentIdx;
          const isCurrent = i === currentIdx;

          return (
            <div key={step.key} className="relative flex gap-4 pb-8 last:pb-0">
              {i < steps.length - 1 && (
                <div
                  className={`absolute left-[15px] top-[32px] h-full w-0.5 ${
                    isCompleted ? "bg-indigo-500" : "bg-neutral-200"
                  }`}
                />
              )}

              <div
                className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  isCompleted
                    ? "bg-indigo-600 text-white"
                    : "bg-neutral-100 text-neutral-400"
                }`}
              >
                {isCompleted && !isCurrent ? (
                  <Check className="h-4 w-4" />
                ) : isCurrent ? (
                  <Circle className="h-4 w-4 fill-current" />
                ) : (
                  <Circle className="h-4 w-4" />
                )}
              </div>

              <div className="flex-1 pt-0.5">
                <p
                  className={`text-sm font-medium ${
                    isCompleted ? "text-neutral-900" : "text-neutral-400"
                  }`}
                >
                  {step.label}
                </p>
                {isCompleted && timestamps[step.key] && (
                  <p className="mt-0.5 text-xs text-neutral-500">
                    {timestamps[step.key]}
                  </p>
                )}
                {isCurrent && !isCompleted && (
                  <p className="mt-0.5 text-xs text-indigo-600">
                    In progress
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
