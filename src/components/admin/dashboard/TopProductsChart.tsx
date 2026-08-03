"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface TopProduct {
  name: string;
  sold: number;
}

interface TopProductsChartProps {
  data: TopProduct[];
}

function truncate(value: string, maxLength = 18) {
  return value.length > maxLength
    ? `${value.slice(0, maxLength - 1)}…`
    : value;
}

export default function TopProductsChart({
  data,
}: TopProductsChartProps) {
  const chartData = data
    .slice(0, 6)
    .map((product) => ({
      ...product,
      name: truncate(product.name),
    }));

  if (chartData.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-neutral-500">
        No product sales available yet.
      </div>
    );
  }

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 4, right: 16, left: 8, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            horizontal={false}
            stroke="#e5e5e5"
          />

          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: "#737373" }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />

          <YAxis
            type="category"
            dataKey="name"
            width={130}
            tick={{ fontSize: 11, fill: "#525252" }}
            tickLine={false}
            axisLine={false}
          />

          <Tooltip
            cursor={{ fill: "#f5f5f5" }}
            contentStyle={{
              borderRadius: "0.75rem",
              border: "1px solid #e5e5e5",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              fontSize: "13px",
            }}
            formatter={(value, name) => [
              value,
              name === "sold" ? "Units sold" : name,
            ]}
            labelStyle={{ fontWeight: 600, color: "#171717" }}
          />

          <Bar
            dataKey="sold"
            fill="#4f46e5"
            radius={[0, 6, 6, 0]}
            barSize={18}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
