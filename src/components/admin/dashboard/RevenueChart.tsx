"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface RevenueChartPoint {
  key: string;
  label: string;
  revenue: number;
}

interface RevenueChartProps {
  data: RevenueChartPoint[];
}

function formatPrice(value: number) {
  return `Rs. ${new Intl.NumberFormat("en-PK").format(
    Math.round(value)
  )}`;
}

export default function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 8, left: 8, bottom: 0 }}
        >
          <defs>
            <linearGradient
              id="revenueFill"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="5%"
                stopColor="#4f46e5"
                stopOpacity={0.35}
              />
              <stop
                offset="95%"
                stopColor="#4f46e5"
                stopOpacity={0.02}
              />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#e5e5e5"
          />

          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "#737373" }}
            tickLine={false}
            axisLine={{ stroke: "#e5e5e5" }}
            interval="preserveStartEnd"
          />

          <YAxis
            tick={{ fontSize: 11, fill: "#737373" }}
            tickLine={false}
            axisLine={false}
            width={56}
            tickFormatter={(value: number) =>
              value >= 1000
                ? `${Math.round(value / 1000)}k`
                : String(value)
            }
          />

          <Tooltip
            cursor={{ stroke: "#4f46e5", strokeWidth: 1 }}
            contentStyle={{
              borderRadius: "0.75rem",
              border: "1px solid #e5e5e5",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              fontSize: "13px",
            }}
            formatter={(value) => [
              formatPrice(Number(value)),
              "Revenue",
            ]}
            labelStyle={{ fontWeight: 600, color: "#171717" }}
          />

          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#4f46e5"
            strokeWidth={2.5}
            fill="url(#revenueFill)"
            dot={false}
            activeDot={{ r: 4, fill: "#4f46e5" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
