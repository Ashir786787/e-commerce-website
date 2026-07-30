import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/services/auth.service";

import User from "@/models/User";
import Product from "@/models/Product";
import Order from "@/models/Order";

export async function GET() {
  try {
    await connectDB();

    const user = await getCurrentUser();

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 403,
        }
      );
    }

    const [
      totalUsers,
      totalProducts,
      totalOrders,
      revenueResult,
    ] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([
        {
          $match: {
            paymentStatus: "paid",
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: {
              $sum: "$total",
            },
          },
        },
      ]),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue:
          revenueResult.length > 0
            ? revenueResult[0].totalRevenue
            : 0,
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load dashboard statistics.",
      },
      {
        status: 500,
      }
    );
  }
}