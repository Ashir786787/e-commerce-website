"use client";

import { useState } from "react";
import { toast } from "sonner";
import ShippingForm from "./ShippingForm";
import PaymentMethod, {
  type CheckoutPaymentMethod,
} from "./PaymentMethod";
import OrderSummary from "./OrderSummary";
import PlaceOrderButton from "./PlaceOrderButton";

type CheckoutFormData = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
};

export default function CheckoutForm() {
  const [shippingAddress, setShippingAddress] =
    useState<CheckoutFormData>({
      fullName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      postalCode: "",
      country: "Pakistan",
    });
  const [paymentMethod, setPaymentMethod] =
    useState<CheckoutPaymentMethod>("cod");
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  function handleShippingChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) {
    const { name, value } = event.target;
    setShippingAddress((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setIsSubmitting(true);

      const orderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          shippingAddress,
          paymentMethod,
        }),
      });

      const orderResult = await orderResponse.json();

      if (!orderResponse.ok || !orderResult.success) {
        throw new Error(
          orderResult.message || "Unable to place order."
        );
      }

      const createdOrder = orderResult.data;
      const orderId = createdOrder?._id;

      if (!orderId) {
        throw new Error(
          "Order was created, but the order ID was not returned."
        );
      }

      if (paymentMethod === "cod") {
        toast.success("Order placed successfully!");
        window.location.href = `/orders/${orderId}`;
        return;
      }

      if (paymentMethod === "card") {
        toast.success(
          "Order created. Redirecting to secure payment..."
        );

        const stripeResponse = await fetch(
          "/api/payments/create-checkout-session",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ orderId }),
          }
        );

        const stripeResult =
          await stripeResponse.json();

        if (
          !stripeResponse.ok ||
          !stripeResult.success
        ) {
          throw new Error(
            stripeResult.message ||
              "Unable to start Stripe Checkout."
          );
        }

        const checkoutUrl =
          stripeResult.data?.checkoutUrl;

        if (!checkoutUrl) {
          throw new Error(
            "Stripe Checkout URL was not returned."
          );
        }

        window.location.href = checkoutUrl;
        return;
      }

      throw new Error(
        "The selected payment method is currently unavailable."
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to place order."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]"
    >
      <div className="space-y-6">
        <ShippingForm
          shippingAddress={shippingAddress}
          onChange={handleShippingChange}
        />
        <PaymentMethod
          value={paymentMethod}
          onChange={setPaymentMethod}
        />
      </div>
      <aside className="h-fit space-y-0 lg:sticky lg:top-24">
        <OrderSummary />
        <PlaceOrderButton
          isLoading={isSubmitting}
          disabled={isSubmitting}
        />
      </aside>
    </form>
  );
}
