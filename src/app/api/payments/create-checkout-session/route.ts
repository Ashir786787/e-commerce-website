import { NextRequest } from "next/server";
import { Types } from "mongoose";

import stripe from "@/lib/stripe";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import "@/models/Product";
import { getCurrentUser } from "@/services/auth.service";
import {
  errorResponse,
  successResponse,
} from "@/utils/api-response";

type CreateCheckoutSessionBody = {
  orderId?: string;
};

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const user = await getCurrentUser();

    if (!user) {
      return errorResponse("Not authenticated.", 401);
    }

    const body =
      (await request.json()) as CreateCheckoutSessionBody;

    if (!body.orderId) {
      return errorResponse("Order ID is required.", 400);
    }

    if (!Types.ObjectId.isValid(body.orderId)) {
      return errorResponse("Invalid order ID.", 400);
    }

    const order = await Order.findOne({
      _id: body.orderId,
      user: user.id,
    }).populate({
      path: "items.product",
      select: "name images",
    });

    if (!order) {
      return errorResponse("Order not found.", 404);
    }

    if (order.paymentMethod !== "card") {
      return errorResponse(
        "This order is not configured for card payment.",
        400
      );
    }

    if (order.paymentStatus === "paid") {
      return errorResponse(
        "This order has already been paid.",
        400
      );
    }

    if (order.orderStatus === "cancelled") {
      return errorResponse(
        "A cancelled order cannot be paid.",
        400
      );
    }

    const appUrl = (
      process.env.NEXT_PUBLIC_APP_URL ||
      request.nextUrl.origin
    ).replace(/\/+$/, "");

    const lineItems = order.items.map((item) => {
      const product = item.product as unknown as {
        name?: string;
      };

      return {
        price_data: {
          currency: "pkr",
          product_data: {
            name: product?.name || "NovaCart Product",
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      };
    });

    if (order.deliveryFee > 0) {
      lineItems.push({
        price_data: {
          currency: "pkr",
          product_data: {
            name: "Delivery Fee",
          },
          unit_amount: Math.round(order.deliveryFee * 100),
        },
        quantity: 1,
      });
    }

    const session =
      await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: lineItems,
        customer_email: order.shippingAddress.email,

        client_reference_id: order._id.toString(),

        metadata: {
          orderId: order._id.toString(),
          userId: user.id.toString(),
        },

        payment_intent_data: {
          metadata: {
            orderId: order._id.toString(),
            userId: user.id.toString(),
          },
        },

        success_url:
          `${appUrl}/checkout/success` +
          `?session_id={CHECKOUT_SESSION_ID}`,

        cancel_url:
          `${appUrl}/checkout/cancel` +
          `?order_id=${order._id.toString()}`,
      });

    if (!session.url) {
      return errorResponse(
        "Stripe checkout URL could not be created.",
        500
      );
    }

    order.paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : undefined;

    await order.save();

    return successResponse(
      "Stripe checkout session created.",
      {
        checkoutUrl: session.url,
        sessionId: session.id,
      }
    );
  } catch (error) {
    console.error(
      "Create Stripe checkout session error:",
      error
    );

    return errorResponse(
      error instanceof Error
        ? error.message
        : "Failed to create Stripe checkout session.",
      500
    );
  }
}