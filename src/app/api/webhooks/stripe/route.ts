import Stripe from "stripe";

import { connectDB } from "@/lib/db";
import stripe from "@/lib/stripe";
import Order from "@/models/Order";

export async function POST(request: Request) {
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature) {
    console.error("Stripe signature header is missing.");

    return Response.json(
      { error: "Stripe signature header is missing." },
      { status: 400 }
    );
  }

  if (!webhookSecret) {
    console.error(
      "STRIPE_WEBHOOK_SECRET is missing from the Vercel environment."
    );

    return Response.json(
      {
        error:
          "STRIPE_WEBHOOK_SECRET is missing from the Vercel environment.",
      },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret
    );
  } catch (error) {
    console.error(
      "Stripe signature verification failed:",
      error
    );

    return Response.json(
      { error: "Invalid Stripe webhook signature." },
      { status: 400 }
    );
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session =
        event.data.object as Stripe.Checkout.Session;

      if (session.payment_status !== "paid") {
        return Response.json({ received: true });
      }

      const orderId =
        session.metadata?.orderId ||
        session.client_reference_id;

      if (!orderId) {
        return Response.json(
          { error: "Order ID is missing from the session." },
          { status: 400 }
        );
      }

      await connectDB();

      const paymentIntentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id;

      const order = await Order.findById(orderId);

      if (!order) {
        return Response.json(
          { error: `Order ${orderId} was not found.` },
          { status: 404 }
        );
      }

      // Safe when Stripe retries the same event.
      if (order.paymentStatus !== "paid") {
        order.paymentStatus = "paid";
        order.orderStatus = "confirmed";
        order.paidAt = new Date();

        if (paymentIntentId) {
          order.paymentIntentId = paymentIntentId;
        }

        await order.save();
      }

      console.log(
        `Stripe webhook completed for order ${order.orderNumber}.`
      );
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error(
      "Stripe webhook processing error:",
      error
    );

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Webhook processing failed.",
      },
      { status: 500 }
    );
  }
}
