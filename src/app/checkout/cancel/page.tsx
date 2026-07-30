import Link from "next/link";
import { XCircle } from "lucide-react";

import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";

export const dynamic = "force-dynamic";

export default function CheckoutCancelPage() {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <SiteHeader />

      <main className="flex flex-1 items-center justify-center px-4 py-16 sm:px-6">
        <section className="w-full max-w-lg overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
          <div className="bg-gradient-to-br from-red-500 to-red-600 px-6 py-10 text-center text-white sm:px-10">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/20">
              <XCircle className="h-11 w-11" />
            </div>

            <h1 className="mt-6 text-3xl font-bold sm:text-4xl">
              Payment Cancelled
            </h1>

            <p className="mt-3 text-red-50">
              Your payment was not completed.
            </p>
          </div>

          <div className="p-6 text-center sm:p-10">
            <p className="text-sm leading-6 text-neutral-600">
              You cancelled the payment. Your order is
              still saved and you can try again later. No
              charges have been made.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/checkout"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-indigo-600 px-6 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Return to Checkout
              </Link>

              <Link
                href="/orders"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-neutral-300 px-6 text-sm font-semibold text-neutral-800 transition hover:border-indigo-300 hover:text-indigo-600"
              >
                My Orders
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}