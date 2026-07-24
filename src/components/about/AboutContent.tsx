import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";
import OurStory from "./OurStory";
import MissionVision from "./MissionVision";
import WhyChooseUs from "./WhyChooseUs";

export default function AboutContent() {
  return (
    <main className="bg-white">
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50 via-white to-white">
        <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-indigo-100/40 blur-3xl" />
        <div className="absolute right-0 bottom-0 h-72 w-72 rounded-full bg-violet-100/40 blur-3xl" />
        <div className="relative mx-auto flex min-h-[70vh] max-w-7xl flex-col items-center justify-center px-6 py-24 text-center lg:px-8">
          <span className="rounded-full border border-indigo-200 bg-indigo-100 px-4 py-1 text-sm font-semibold uppercase tracking-[0.2em] text-indigo-700">
            About NovaCart
          </span>
          <h1 className="mt-8 max-w-4xl text-5xl font-bold tracking-tight text-gray-900 lg:text-7xl">
            Your Trusted Marketplace
            <span className="block text-indigo-600">
              for Quality Products
            </span>
          </h1>
          <p className="mt-8 max-w-3xl text-lg leading-8 text-gray-600">
            NovaCart is a modern online marketplace built to deliver
            premium products, secure shopping, fast delivery and an
            exceptional customer experience. Our mission is to make
            online shopping simple, reliable and enjoyable for everyone.
          </p>
          <div className="mt-12 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-8 py-4 text-base font-semibold text-white transition hover:bg-indigo-700"
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              Shop Now
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-8 py-4 text-base font-semibold text-gray-700 transition hover:border-indigo-600 hover:text-indigo-600"
            >
              Contact Us
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
      <OurStory />
      <MissionVision />
      <WhyChooseUs />
    </main>
  );
}
