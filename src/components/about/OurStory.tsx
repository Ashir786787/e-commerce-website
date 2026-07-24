import { CheckCircle2 } from "lucide-react";

const highlights = [
  "Premium Quality Products",
  "Secure & Trusted Shopping",
  "Fast Nationwide Delivery",
  "Customer-First Experience",
];

export default function OurStory() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-2 lg:px-8">
        <div className="relative">
          <div className="aspect-[4/5] overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-100 via-white to-violet-100 shadow-xl">
            <div className="flex h-full items-center justify-center p-10 text-center">
              <div>
                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-indigo-600 text-4xl font-bold text-white">
                  N
                </div>
                <h3 className="text-3xl font-bold text-gray-900">
                  NovaCart
                </h3>
                <p className="mt-3 text-gray-600">
                  Premium Shopping Experience
                </p>
              </div>
            </div>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
            Our Story
          </p>
          <h2 className="mt-4 text-4xl font-bold text-gray-900">
            Built Around Trust,
            Quality and Convenience
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            NovaCart was created with a simple vision:
            to make online shopping secure, convenient,
            and enjoyable for everyone.
          </p>
          <p className="mt-5 text-lg leading-8 text-gray-600">
            We believe customers deserve high-quality
            products, transparent pricing, reliable
            delivery and exceptional service from the
            moment they visit our marketplace until
            their order arrives at their doorstep.
          </p>
          <div className="mt-8 grid gap-4">
            {highlights.map((item) => (
              <div
                key={item}
                className="flex items-center gap-3"
              >
                <CheckCircle2 className="h-6 w-6 text-indigo-600" />
                <span className="text-base font-medium text-gray-700">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
