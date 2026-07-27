interface OrderStatusBadgeProps {
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
}

const statusStyles = {
  pending:
    "bg-yellow-100 text-yellow-700",

  confirmed:
    "bg-blue-100 text-blue-700",

  processing:
    "bg-indigo-100 text-indigo-700",

  shipped:
    "bg-purple-100 text-purple-700",

  delivered:
    "bg-green-100 text-green-700",

  cancelled:
    "bg-red-100 text-red-700",
};

export default function OrderStatusBadge({
  status,
}: OrderStatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}
