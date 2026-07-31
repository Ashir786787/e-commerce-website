import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";

import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import "@/models/Product";
import { getCurrentUser } from "@/services/auth.service";

interface AdminOrderRouteProps {
  params: Promise<{
    id: string;
  }>;
}

type UpdateOrderBody = {
  orderStatus?:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  paymentStatus?: "pending" | "paid" | "failed";
};

const validOrderStatuses = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

const validPaymentStatuses = [
  "pending",
  "paid",
  "failed",
] as const;

export async function GET(
  _request: NextRequest,
  { params }: AdminOrderRouteProps
) {
  try {
    await connectDB();

    const currentUser = await getCurrentUser();

    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Admin access is required.",
        },
        {
          status: 403,
        }
      );
    }

    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid order ID.",
        },
        {
          status: 400,
        }
      );
    }

    const order = await Order.findById(id)
      .populate({
        path: "user",
        select: "fullName email",
      })
      .populate({
        path: "items.product",
        select: "name slug images brand",
      })
      .lean();

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Load admin order error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to load order.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: AdminOrderRouteProps
) {
  try {
    await connectDB();

    const currentUser = await getCurrentUser();

    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Admin access is required.",
        },
        {
          status: 403,
        }
      );
    }

    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid order ID.",
        },
        {
          status: 400,
        }
      );
    }

    const body = (await request.json()) as UpdateOrderBody;

    if (
      body.orderStatus !== undefined &&
      !validOrderStatuses.includes(body.orderStatus)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid order status.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      body.paymentStatus !== undefined &&
      !validPaymentStatuses.includes(
        body.paymentStatus
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid payment status.",
        },
        {
          status: 400,
        }
      );
    }

    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (body.orderStatus !== undefined) {
      order.orderStatus = body.orderStatus;

      if (body.orderStatus === "delivered") {
        order.deliveredAt =
          order.deliveredAt || new Date();
      } else {
        order.deliveredAt = undefined;
      }
    }

    if (body.paymentStatus !== undefined) {
      order.paymentStatus = body.paymentStatus;

      if (
        body.paymentStatus === "paid" &&
        !order.paidAt
      ) {
        order.paidAt = new Date();
      }

      if (body.paymentStatus !== "paid") {
        order.paidAt = undefined;
      }
    }

    await order.save();

    return NextResponse.json({
      success: true,
      message: "Order updated successfully.",
      data: {
        id: order._id.toString(),
        orderNumber: order.orderNumber,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        paidAt: order.paidAt,
        deliveredAt: order.deliveredAt,
      },
    });
  } catch (error) {
    console.error("Update admin order error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to update order.",
      },
      {
        status: 500,
      }
    );
  }
}
