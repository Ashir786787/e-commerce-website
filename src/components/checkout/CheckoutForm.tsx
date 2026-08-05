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

type AppliedDiscount = {
  code: string;
  percent: number;
};

export default function CheckoutForm() {
  const [shippingAddress, setShippingAddress] = useState<CheckoutFormData>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "Pakistan",
  });
  const [paymentMethod, setPaymentMethod] = useState<CheckoutPaymentMethod>("cod");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState<AppliedDiscount | null>(null);
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);

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

  async function handleApplyDiscount(code: string) {
    setIsApplyingDiscount(true);
    try {
      const res = await fetch("/api/discount/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ code }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message || "Invalid code");
      setAppliedDiscount({ code: code.toUpperCase(), percent: result.data.discountPercent });
      toast.success("Discount applied!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to apply discount");
    } finally {
      setIsApplyingDiscount(false);
    }
  }

  function handleRemoveDiscount() {
    setAppliedDiscount(null);
    toast.success("Discount removed");
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setIsSubmitting(true);

      const body: Record<string, unknown> = { shippingAddress, paymentMethod };
      if (appliedDiscount?.code) body.discountCode = appliedDiscount.code;

      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const orderResult = await orderRes.json();
      if (!orderRes.ok || !orderResult.success) throw new Error(orderResult.message || "Failed to place order");

      const orderId = orderResult.data?._id;
      if (!orderId) throw new Error("Order ID missing from response");

      if (paymentMethod === "cod") {
        toast.success("Order placed!");
        window.location.href = `/orders/${orderId}`;
        return;
      }

      if (paymentMethod === "card") {
        toast.success("Redirecting to payment...");

        const stripeRes = await fetch("/api/payments/create-checkout-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ orderId }),
        });
        const stripeResult = await stripeRes.json();
        if (!stripeRes.ok || !stripeResult.success) throw new Error(stripeResult.message || "Stripe failed");

        const checkoutUrl = stripeResult.data?.checkoutUrl;
        if (!checkoutUrl) throw new Error("No checkout URL returned");
        window.location.href = checkoutUrl;
        return;
      }

      throw new Error("Payment method unavailable");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Order failed");
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
        <OrderSummary
          appliedDiscount={appliedDiscount}
          onApplyDiscount={handleApplyDiscount}
          onRemoveDiscount={handleRemoveDiscount}
          isApplyingDiscount={isApplyingDiscount}
        />
        <PlaceOrderButton
          isLoading={isSubmitting}
          disabled={isSubmitting}
        />
      </aside>
    </form>
  );
}