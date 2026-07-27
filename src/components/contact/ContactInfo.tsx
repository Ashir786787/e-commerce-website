import { Clock, Mail, MapPin, Phone } from "lucide-react";

const contactDetails = [
  {
    icon: Phone,
    title: "Call Us",
    description: "Mon to Sat, 9AM - 6PM",
    value: "+92 300 1234567",
    href: "tel:+923001234567",
    color: "indigo",
  },
  {
    icon: Mail,
    title: "Email Us",
    description: "We reply within 24 hours",
    value: "support@novacart.com",
    href: "mailto:support@novacart.com",
    color: "violet",
  },
  {
    icon: MapPin,
    title: "Visit Us",
    description: "Come say hello",
    value: "Lahore, Pakistan",
    href: null,
    color: "indigo",
  },
  {
    icon: Clock,
    title: "Business Hours",
    description: "We are available",
    value: "Mon - Sat: 9AM - 6PM",
    href: null,
    color: "violet",
  },
];

export default function ContactInfo() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {contactDetails.map((detail) => {
            const Icon = detail.icon;
            return (
              <div
                key={detail.title}
                className="group rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm transition duration-300 hover:-translate-y-2 hover:border-indigo-200 hover:shadow-xl"
              >
                <div
                  className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl transition duration-300 ${
                    detail.color === "indigo"
                      ? "bg-indigo-100 group-hover:bg-indigo-600"
                      : "bg-violet-100 group-hover:bg-violet-600"
                  }`}
                >
                  <Icon
                    className={`h-8 w-8 transition duration-300 ${
                      detail.color === "indigo"
                        ? "text-indigo-600 group-hover:text-white"
                        : "text-violet-600 group-hover:text-white"
                    }`}
                  />
                </div>
                <h3 className="mt-6 text-lg font-bold text-gray-900">
                  {detail.title}
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {detail.description}
                </p>
                {detail.href ? (
                  <a
                    href={detail.href}
                    className="mt-3 block text-base font-semibold text-indigo-600 transition hover:text-indigo-700"
                  >
                    {detail.value}
                  </a>
                ) : (
                  <p className="mt-3 text-base font-semibold text-gray-900">
                    {detail.value}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
