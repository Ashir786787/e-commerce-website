import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import "@/models/Product";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { trackingNumber, email } = body;

    if (!trackingNumber?.trim() || !email?.trim()) {
      return NextResponse.json(
        { error: "Tracking number and email are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const order = await Order.findOne({
      trackingNumber: trackingNumber.trim().toUpperCase(),
      "shippingAddress.email": email.trim().toLowerCase(),
    })
      .populate({ path: "items.product", select: "name brand images" })
      .lean();

    if (!order) {
      return NextResponse.json(
        { error: "No order found with that tracking number and email combination" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      orderNumber: order.orderNumber,
      trackingNumber: order.trackingNumber,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      total: order.total,
      paymentMethod: order.paymentMethod,
      items: order.items.map((item) => {
        const product = item.product as unknown as {
          name?: string;
          brand?: string;
        };
        return {
          name: product?.name || "Product",
          brand: product?.brand || "NovaCart",
          quantity: item.quantity,
          price: item.price,
        };
      }),
      shippingAddress: order.shippingAddress,
      createdAt: order.createdAt,
      paidAt: order.paidAt,
      deliveredAt: order.deliveredAt,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to track order" },
      { status: 500 }
    );
  }
}
