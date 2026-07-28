import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import stripe from "@/lib/stripe";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { error: "Missing stripe signature or webhook secret." },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 }
    );
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  const orderId = session.metadata?.orderId;

  if (!orderId) {
    return NextResponse.json(
      { error: "No orderId in session metadata." },
      { status: 400 }
    );
  }

  await connectDB();

  const order = await Order.findById(orderId);

  if (!order) {
    return NextResponse.json(
      { error: "Order not found." },
      { status: 404 }
    );
  }

  if (order.paymentStatus === "paid") {
    return NextResponse.json({ received: true });
  }

  order.paymentStatus = "paid";
  order.orderStatus = "confirmed";
  order.paidAt = new Date();

  if (
    typeof session.payment_intent === "string"
  ) {
    order.paymentIntentId = session.payment_intent;
  }

  await order.save();

  return NextResponse.json({ received: true });
}
