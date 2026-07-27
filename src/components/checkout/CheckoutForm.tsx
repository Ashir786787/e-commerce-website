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
      const response = await fetch("/api/orders", {
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
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to place order."
        );
      }
      toast.success("Order placed successfully!");
      window.location.href = "/orders";
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
