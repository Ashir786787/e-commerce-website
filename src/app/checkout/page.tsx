import CheckoutForm from "@/components/checkout/CheckoutForm";

export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-neutral-50">
      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
            Secure Checkout
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-neutral-950">
            Complete your order
          </h1>

          <p className="mt-2 text-sm text-neutral-500">
            Enter your delivery details and choose your payment method.
          </p>
        </div>

        <CheckoutForm />
      </section>
    </main>
  );
}
