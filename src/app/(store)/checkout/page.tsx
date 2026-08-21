import CheckoutForm from "@/components/checkout/CheckoutForm";
import CheckoutStepIndicator from "@/components/checkout/CheckoutStepIndicator";

export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-neutral-50">
      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <CheckoutStepIndicator currentStep={0} />

        <div className="mb-8 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
            Secure Checkout
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-950 sm:text-3xl">
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
