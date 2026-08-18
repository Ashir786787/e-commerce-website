"use client";

import { useState } from "react";
import { Package, Search, MapPin, CreditCard, Clock } from "lucide-react";

import OrderTimeline from "@/components/orders/OrderTimeline";

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-PK").format(value);
}

function formatPaymentMethod(method: string) {
  const labels: Record<string, string> = {
    cod: "Cash on Delivery",
    card: "Credit / Debit Card",
    bank: "Bank Transfer",
  };
  return labels[method] || method;
}

interface OrderResult {
  orderNumber: string;
  trackingNumber: string;
  orderStatus: string;
  paymentStatus: string;
  total: number;
  paymentMethod: string;
  items: {
    name: string;
    brand: string;
    quantity: number;
    price: number;
  }[];
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  createdAt: string;
  paidAt?: string | null;
  deliveredAt?: string | null;
}

export default function TrackOrderPage() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<OrderResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleTrack(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const res = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackingNumber, email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to track order");
        return;
      }

      setResult(data);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
        <section className="border-b bg-background">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              Order Tracking
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight">
              Track Your Order
            </h1>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              Enter your tracking number and email to see the current status of your order.
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
            <form onSubmit={handleTrack} className="rounded-2xl border bg-white p-8 shadow-sm">
              <div className="space-y-4">
                <div>
                  <label htmlFor="trackingNumber" className="mb-1.5 block text-sm font-medium text-foreground">
                    Tracking Number
                  </label>
                  <div className="relative">
                    <Package className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="trackingNumber"
                      type="text"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="TRK-XXXXXXXX"
                      required
                      className="w-full rounded-xl border bg-muted/30 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">
                    Email Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="w-full rounded-xl border bg-muted/30 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading ? "Tracking..." : "Track Order"}
                </button>
              </div>

              {error && (
                <p className="mt-4 rounded-lg bg-red-50 p-3 text-center text-sm text-red-600">
                  {error}
                </p>
              )}
            </form>

            {result && (
              <div className="mt-8 space-y-6">
                <div className="rounded-2xl border bg-white p-6 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Order
                      </p>
                      <p className="mt-1 text-lg font-bold text-indigo-600">
                        {result.orderNumber}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Tracking
                      </p>
                      <p className="mt-1 font-mono text-sm font-semibold">
                        {result.trackingNumber}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                        result.orderStatus === "delivered"
                          ? "bg-green-100 text-green-700"
                          : result.orderStatus === "cancelled"
                            ? "bg-red-100 text-red-700"
                            : "bg-indigo-100 text-indigo-700"
                      }`}
                    >
                      {result.orderStatus}
                    </span>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                        result.paymentStatus === "paid"
                          ? "bg-emerald-100 text-emerald-700"
                          : result.paymentStatus === "failed"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      Payment: {result.paymentStatus}
                    </span>
                  </div>
                </div>

                <OrderTimeline
                  currentStatus={result.orderStatus as "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled"}
                  createdAt={result.createdAt}
                  paidAt={result.paidAt}
                  deliveredAt={result.deliveredAt}
                />

                <div className="rounded-2xl border bg-white p-6 shadow-sm">
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Order Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <CreditCard className="h-4 w-4" />
                        Payment Method
                      </span>
                      <span className="font-medium">{formatPaymentMethod(result.paymentMethod)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        Order Date
                      </span>
                      <span className="font-medium">
                        {new Date(result.createdAt).toLocaleDateString("en-PK", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="border-t pt-3">
                      <p className="text-sm font-semibold text-foreground">
                        Total: Rs. {formatPrice(result.total)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border bg-white p-6 shadow-sm">
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Items ({result.items.length})
                  </h3>
                  <div className="divide-y">
                    {result.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                        <div>
                          <p className="text-sm font-medium text-foreground">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.brand}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">Qty: {item.quantity}</p>
                          <p className="text-xs text-muted-foreground">Rs. {formatPrice(item.price)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
    </main>
  );
}
