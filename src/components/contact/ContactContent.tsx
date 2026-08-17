import Link from "next/link";
import { HelpCircle, MessageSquare, Shield, Truck } from "lucide-react";
import ContactHero from "./ContactHero";
import ContactInfo from "./ContactInfo";
import ContactForm from "./ContactForm";

const quickHelp = [
  {
    icon: Truck,
    title: "Track Your Order",
    description: "Check the status of your recent orders using your tracking number.",
    href: "/track",
  },
  {
    icon: Shield,
    title: "Secure Shopping",
    description: "All transactions are encrypted and your personal data is protected.",
  },
  {
    icon: HelpCircle,
    title: "FAQs",
    description: "Find quick answers to common questions about orders, shipping, and returns.",
    href: "/faq",
  },
];

export default function ContactContent() {
  return (
    <main className="bg-white">
      <ContactHero />
      <ContactInfo />

      <section className="bg-gray-50 py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
              Send a Message
            </p>
            <h2 className="mt-4 text-4xl font-bold text-gray-900">
              Let&apos;s Start a Conversation
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Fill out the form below and our team will get back to you as
              soon as possible. We are here to help with anything you need.
            </p>
          </div>

          <div className="mt-16 grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm sm:p-10">
              <ContactForm />
            </div>

            <div className="flex flex-col gap-6">
              <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-violet-50 p-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600">
                    <MessageSquare className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Quick Help
                    </h3>
                    <p className="text-sm text-gray-500">
                      Common topics
                    </p>
                  </div>
                </div>
                <div className="mt-6 space-y-5">
                  {quickHelp.map((item) => {
                    const Icon = item.icon;
                    return item.href ? (
                      <Link
                        key={item.title}
                        href={item.href}
                        className="flex gap-4 cursor-pointer transition hover:bg-white/50 rounded-xl p-2 -m-2"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                          <Icon className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {item.title}
                          </h4>
                          <p className="mt-1 text-sm leading-6 text-gray-600">
                            {item.description}
                          </p>
                        </div>
                      </Link>
                    ) : (
                      <div key={item.title} className="flex gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                          <Icon className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {item.title}
                          </h4>
                          <p className="mt-1 text-sm leading-6 text-gray-600">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900">
                  Our Commitment
                </h3>
                <p className="mt-3 leading-7 text-gray-600">
                  We are dedicated to providing exceptional customer service.
                  Every message matters to us and we strive to resolve all
                  inquiries promptly and professionally.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
