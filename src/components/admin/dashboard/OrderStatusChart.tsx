"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  confirmed: "#3b82f6",
  processing: "#8b5cf6",
  shipped: "#0ea5e9",
  delivered: "#10b981",
  cancelled: "#ef4444",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

interface OrderStatusChartProps {
  data: { _id: string; count: number }[];
}

export default function OrderStatusChart({
  data,
}: OrderStatusChartProps) {
  const chartData = data
    .filter((item) => item.count > 0)
    .map((item) => ({
      name: STATUS_LABELS[item._id] || item._id,
      value: item.count,
      color: STATUS_COLORS[item._id] || "#a3a3a3",
    }));

  if (chartData.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-neutral-500">
        No orders available yet.
      </div>
    );
  }

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={52}
            outerRadius={80}
            paddingAngle={3}
            strokeWidth={0}
          >
            {chartData.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>

          <Tooltip
            contentStyle={{
              borderRadius: "0.75rem",
              border: "1px solid #e5e5e5",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              fontSize: "13px",
            }}
            formatter={(value, name) => [value, name]}
          />

          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: "12px" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
