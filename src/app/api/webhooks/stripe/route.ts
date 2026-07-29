import { headers } from "next/headers";
import Stripe from "stripe";

import { connectDB } from "@/lib/db";
import stripe from "@/lib/stripe";
import Order from "@/models/Order";

export async function POST(request: Request) {
  const payload = await request.text();
  const signature = (await headers()).get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature) {
    return new Response("Missing Stripe signature.", {
      status: 400,
    });
  }

  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is missing.");

    return new Response(
      "Stripe webhook secret is not configured.",
      {
        status: 500,
      }
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
      "Stripe webhook signature verification failed:",
      error
    );

    return new Response("Invalid Stripe signature.", {
      status: 400,
    });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session =
        event.data.object as Stripe.Checkout.Session;

      /*
       * We only confirm the order when Stripe reports
       * that the Checkout Session is actually paid.
       */
      if (session.payment_status !== "paid") {
        console.log(
          `Checkout Session ${session.id} is not paid yet.`
        );

        return Response.json({
          received: true,
        });
      }

      const orderId =
        session.metadata?.orderId ||
        session.client_reference_id;

      if (!orderId) {
        console.error(
          `No order ID found for Stripe session ${session.id}.`
        );

        return new Response(
          "Order ID is missing from the Stripe session.",
          {
            status: 400,
          }
        );
      }

      await connectDB();

      const paymentIntentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id;

      /*
       * updateOne makes the webhook safe if Stripe
       * sends the same event more than once.
       */
      const result = await Order.updateOne(
        {
          _id: orderId,
          paymentStatus: { $ne: "paid" },
        },
        {
          $set: {
            paymentStatus: "paid",
            orderStatus: "confirmed",
            paidAt: new Date(),
            ...(paymentIntentId
              ? { paymentIntentId }
              : {}),
          },
        }
      );

      if (result.matchedCount === 0) {
        const existingOrder =
          await Order.findById(orderId)
            .select(
              "orderNumber paymentStatus orderStatus"
            )
            .lean();

        if (!existingOrder) {
          console.error(
            `Order ${orderId} was not found.`
          );

          return new Response("Order not found.", {
            status: 404,
          });
        }

        console.log(
          `Order ${existingOrder.orderNumber} was already processed.`
        );
      } else {
        console.log(
          `Order ${orderId} was marked as paid and confirmed.`
        );
      }
    }

    return Response.json({
      received: true,
    });
  } catch (error) {
    console.error(
      "Stripe webhook processing failed:",
      error
    );

    return new Response(
      "Webhook processing failed.",
      {
        status: 500,
      }
    );
  }
}