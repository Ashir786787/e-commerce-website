import { HeartHandshake, Lock, ShieldCheck, Truck } from "lucide-react";

const stats = [
  { number: "10K+", label: "Happy Customers" },
  { number: "5K+", label: "Quality Products" },
  { number: "99%", label: "Customer Satisfaction" },
  { number: "24/7", label: "Customer Support" },
];

const highlights = [
  { icon: ShieldCheck, text: "Premium Quality Products" },
  { icon: Lock, text: "Secure & Trusted Shopping" },
  { icon: Truck, text: "Fast Nationwide Delivery" },
  { icon: HeartHandshake, text: "Customer-First Experience" },
];

export default function OurStory() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-2 lg:px-8">
        <div className="relative">
          <div className="aspect-[4/5] overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-100 via-white to-violet-100 shadow-xl">
            <div className="flex h-full items-center justify-center p-10">
              <div className="grid w-full grid-cols-2 gap-4">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-white/60 bg-white/70 p-6 text-center shadow-sm backdrop-blur"
                  >
                    <p className="text-3xl font-bold text-indigo-600">
                      {stat.number}
                    </p>
                    <p className="mt-2 text-sm font-medium text-gray-600">
                      {stat.label}
                    </p>
                  </div>
                ))}
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
            {highlights.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.text}
                  className="flex items-center gap-3"
                >
                  <Icon className="h-6 w-6 text-indigo-600" />
                  <span className="text-base font-medium text-gray-700">
                    {item.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
