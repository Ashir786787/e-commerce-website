import { Types } from "mongoose";

import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";

export type AnalyticsPeriod = "7d" | "30d" | "90d" | "12m" | "all";

const validPeriods: AnalyticsPeriod[] = ["7d", "30d", "90d", "12m", "all"];

const periodDays: Record<AnalyticsPeriod, number | null> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  "12m": 365,
  all: null,
};

export function parsePeriod(value?: string | null): AnalyticsPeriod {
  if (value && (validPeriods as string[]).includes(value)) {
    return value as AnalyticsPeriod;
  }
  return "all";
}

export interface StatusCount {
  _id: string;
  count: number;
}

export interface RevenueTrendPoint {
  key: string;
  label: string;
  revenue: number;
}

export interface RecentOrderRow {
  _id: Types.ObjectId;
  orderNumber: string;
  total: number;
  orderStatus: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed";
  createdAt: Date;
  user: {
    fullName?: string;
    email?: string;
  } | null;
}

export interface ProductSummaryRow {
  _id: Types.ObjectId;
  name: string;
  brand: string;
  sold: number;
  stock: number;
  images: {
    url: string;
  }[];
}

export interface AdminStatistics {
  totals: {
    users: number;
    products: number;
    categories: number;
    orders: number;
    revenue: number;
    pendingRevenue: number;
    avgOrderValue: number;
  };
  orderStatusBreakdown: StatusCount[];
  paymentStatusBreakdown: StatusCount[];
  revenueTrend: RevenueTrendPoint[];
  recentOrders: RecentOrderRow[];
  topSellingProducts: ProductSummaryRow[];
  lowStockProducts: ProductSummaryRow[];
}

function getFromDate(period: AnalyticsPeriod): Date | null {
  const days = periodDays[period];
  if (days === null) {
    return null;
  }
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

function formatKeyUTC(date: Date, granularity: "day" | "month") {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");

  if (granularity === "month") {
    return `${year}-${month}`;
  }

  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function zeroFillTrend(period: AnalyticsPeriod, raw: { _id: string; revenue: number }[]): RevenueTrendPoint[] {
  const revenueByKey = new Map(raw.map((item) => [item._id, item.revenue]));
  const points: RevenueTrendPoint[] = [];
  const now = new Date();

  if (period === "7d" || period === "30d") {
    const days = periodDays[period] as number;
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - days + 1));

    for (let index = 0; index < days; index++) {
      const date = new Date(start);
      date.setUTCDate(start.getUTCDate() + index);

      const key = formatKeyUTC(date, "day");
      points.push({
        key,
        label: date.toLocaleDateString("en-PK", { timeZone: "UTC", day: "numeric" }),
        revenue: revenueByKey.get(key) || 0,
      });
    }

    return points;
  }

  const months = period === "90d" ? 3 : 12;
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (months - 1), 1));

  for (let index = 0; index < months; index++) {
    const date = new Date(start);
    date.setUTCMonth(start.getUTCMonth() + index);

    const key = formatKeyUTC(date, "month");
    points.push({
      key,
      label: date.toLocaleDateString("en-PK", { timeZone: "UTC", month: "short" }),
      revenue: revenueByKey.get(key) || 0,
    });
  }

  return points;
}

export async function getAdminStatistics(periodValue?: string | null): Promise<AdminStatistics> {
  await connectDB();

  const period = parsePeriod(periodValue);
  const fromDate = getFromDate(period);
  const dateFilter = fromDate ? { createdAt: { $gte: fromDate } } : {};

  const revenueMatch = { paymentStatus: "paid" as const, orderStatus: { $ne: "cancelled" as const }, ...dateFilter };
  const pendingMatch = { paymentStatus: "pending" as const, orderStatus: { $ne: "cancelled" as const }, ...dateFilter };

  const [
    totalUsers,
    totalProducts,
    totalCategories,
    totalOrders,
    paidOrderCount,
    paidRevenueResult,
    pendingRevenueResult,
    orderStatusBreakdown,
    paymentStatusBreakdown,
    revenueTrendResult,
    recentOrders,
    topSellingProducts,
    lowStockProducts,
  ] = await Promise.all([
    User.countDocuments(),
    Product.countDocuments(),
    Category.countDocuments(),
    Order.countDocuments(dateFilter),
    Order.countDocuments(revenueMatch),
    Order.aggregate<{ _id: null; total: number }>([
      { $match: revenueMatch },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]),
    Order.aggregate<{ _id: null; total: number }>([
      { $match: pendingMatch },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]),
    Order.aggregate<StatusCount>([
      { $match: dateFilter },
      { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
    ]),
    Order.aggregate<StatusCount>([
      { $match: dateFilter },
      { $group: { _id: "$paymentStatus", count: { $sum: 1 } } },
    ]),
    Order.aggregate<{ _id: string; revenue: number }>([
      { $match: revenueMatch },
      {
        $group: {
          _id: { $dateToString: { format: period === "7d" || period === "30d" ? "%Y-%m-%d" : "%Y-%m", date: "$createdAt" } },
          revenue: { $sum: "$total" },
        },
      },
    ]),
    Order.find(dateFilter)
      .populate({ path: "user", select: "fullName email" })
      .select("user orderNumber total orderStatus paymentStatus createdAt")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean() as unknown as Promise<RecentOrderRow[]>,
    Product.find()
      .select("name brand sold stock images")
      .sort({ sold: -1 })
      .limit(5)
      .lean() as unknown as Promise<ProductSummaryRow[]>,
    Product.find({ stock: { $lte: 5 }, isActive: true })
      .select("name brand sold stock images")
      .sort({ stock: 1 })
      .limit(8)
      .lean() as unknown as Promise<ProductSummaryRow[]>,
  ]);

  const totalRevenue = paidRevenueResult[0]?.total || 0;
  const pendingRevenue = pendingRevenueResult[0]?.total || 0;
  const avgOrderValue = paidOrderCount > 0 ? Math.round((totalRevenue / paidOrderCount) * 100) / 100 : 0;

  return {
    totals: {
      users: totalUsers,
      products: totalProducts,
      categories: totalCategories,
      orders: totalOrders,
      revenue: totalRevenue,
      pendingRevenue,
      avgOrderValue,
    },
    orderStatusBreakdown,
    paymentStatusBreakdown,
    revenueTrend: zeroFillTrend(period, revenueTrendResult),
    recentOrders,
    topSellingProducts,
    lowStockProducts,
  };
}
