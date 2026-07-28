import Link from "next/link";
import {
  CheckCircle2,
  PackageCheck,
  ReceiptText,
} from "lucide-react";

import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import stripe from "@/lib/stripe";

export const dynamic = "force-dynamic";

interface PaymentSuccessPageProps {
  searchParams: Promise<{
    session_id?: string;
  }>;
}

function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(amount / 100);
}

export default async function PaymentSuccessPage({
  searchParams,
}: PaymentSuccessPageProps) {
  const { session_id: sessionId } = await searchParams;

  let paymentDetails:
    | {
        orderId: string | null;
        customerEmail: string | null;
        paymentStatus: string;
        amountTotal: number;
        currency: string;
      }
    | null = null;

  if (sessionId) {
    try {
      const session =
        await stripe.checkout.sessions.retrieve(sessionId);

      paymentDetails = {
        orderId:
          session.metadata?.orderId ||
          session.client_reference_id ||
          null,
        customerEmail:
          session.customer_details?.email ||
          session.customer_email ||
          null,
        paymentStatus: session.payment_status,
        amountTotal: session.amount_total || 0,
        currency: session.currency || "pkr",
      };
    } catch (error) {
      console.error(
        "Unable to retrieve Stripe session:",
        error
      );
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <SiteHeader />

      <main className="flex flex-1 items-center justify-center px-4 py-16 sm:px-6">
        <section className="w-full max-w-2xl overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 px-6 py-10 text-center text-white sm:px-10">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/20">
              <CheckCircle2 className="h-11 w-11" />
            </div>

            <h1 className="mt-6 text-3xl font-bold sm:text-4xl">
              Payment Successful
            </h1>

            <p className="mt-3 text-emerald-50">
              Thank you for shopping with NovaCart.
            </p>
          </div>

          <div className="p-6 sm:p-10">
            {paymentDetails ? (
              <>
                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
                  <div className="flex items-start gap-4">
                    <ReceiptText className="mt-1 h-6 w-6 shrink-0 text-indigo-600" />

                    <div className="min-w-0 flex-1 space-y-4">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm text-neutral-500">
                          Payment status
                        </span>

                        <span className="font-semibold capitalize text-emerald-600">
                          {paymentDetails.paymentStatus}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm text-neutral-500">
                          Amount paid
                        </span>

                        <span className="font-semibold text-neutral-950">
                          {formatPrice(
                            paymentDetails.amountTotal,
                            paymentDetails.currency
                          )}
                        </span>
                      </div>

                      {paymentDetails.orderId && (
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-sm text-neutral-500">
                            Order ID
                          </span>

                          <span className="max-w-[240px] truncate font-mono text-sm font-medium text-neutral-950">
                            {paymentDetails.orderId}
                          </span>
                        </div>
                      )}

                      {paymentDetails.customerEmail && (
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-sm text-neutral-500">
                            Confirmation email
                          </span>

                          <span className="max-w-[260px] truncate text-sm font-medium text-neutral-950">
                            {paymentDetails.customerEmail}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-start gap-3 rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
                  <PackageCheck className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" />

                  <p className="text-sm leading-6 text-indigo-800">
                    Your payment was received. Your order
                    will appear in My Orders after payment
                    verification is completed.
                  </p>
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-center">
                <p className="font-medium text-amber-900">
                  Payment completed, but the Checkout
                  Session details could not be loaded.
                </p>

                <p className="mt-2 text-sm text-amber-700">
                  Open My Orders to review your order.
                </p>
              </div>
            )}

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {paymentDetails?.orderId ? (
                <Link
                  href={`/orders/${paymentDetails.orderId}`}
                  className="inline-flex h-12 items-center justify-center rounded-xl bg-indigo-600 px-6 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  View Order
                </Link>
              ) : (
                <Link
                  href="/orders"
                  className="inline-flex h-12 items-center justify-center rounded-xl bg-indigo-600 px-6 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  View My Orders
                </Link>
              )}

              <Link
                href="/products"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-neutral-300 px-6 text-sm font-semibold text-neutral-800 transition hover:border-indigo-300 hover:text-indigo-600"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}