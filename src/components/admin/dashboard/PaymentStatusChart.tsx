"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const PAYMENT_COLORS: Record<string, string> = {
  paid: "#10b981",
  pending: "#f59e0b",
  failed: "#ef4444",
};

const PAYMENT_LABELS: Record<string, string> = {
  paid: "Paid",
  pending: "Pending",
  failed: "Failed",
};

interface PaymentStatusChartProps {
  data: { _id: string; count: number }[];
}

export default function PaymentStatusChart({
  data,
}: PaymentStatusChartProps) {
  const chartData = data
    .filter((item) => item.count > 0)
    .map((item) => ({
      name: PAYMENT_LABELS[item._id] || item._id,
      value: item.count,
      color: PAYMENT_COLORS[item._id] || "#a3a3a3",
    }));

  if (chartData.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-neutral-500">
        No payment data available yet.
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

          <text
            x="50%"
            y="47%"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="13"
            fontWeight={600}
            fill="#737373"
          >
            Payments
          </text>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
