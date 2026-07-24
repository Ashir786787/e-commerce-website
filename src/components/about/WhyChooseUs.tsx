import {
  ShieldCheck,
  Package,
  Truck,
  Headphones,
} from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Secure Shopping",
    description:
      "Shop confidently with secure authentication and protected transactions.",
  },
  {
    icon: Package,
    title: "Premium Products",
    description:
      "Every product is carefully selected to ensure quality and reliability.",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    description:
      "Quick and dependable shipping to get your orders delivered on time.",
  },
  {
    icon: Headphones,
    title: "Customer Support",
    description:
      "Our dedicated support team is always ready to assist you whenever needed.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
            Why Choose NovaCart
          </p>
          <h2 className="mt-4 text-4xl font-bold text-gray-900">
            Everything You Need
            For A Better Shopping Experience
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            NovaCart combines premium products, secure technology
            and exceptional customer service to create a seamless
            online shopping experience.
          </p>
        </div>
        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group rounded-3xl border border-gray-200 bg-white p-8 shadow-sm transition duration-300 hover:-translate-y-2 hover:border-indigo-200 hover:shadow-xl"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 transition group-hover:bg-indigo-600">
                  <Icon className="h-8 w-8 text-indigo-600 transition group-hover:text-white" />
                </div>
                <h3 className="mt-8 text-xl font-bold text-gray-900">
                  {feature.title}
                </h3>
                <p className="mt-4 leading-7 text-gray-600">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
