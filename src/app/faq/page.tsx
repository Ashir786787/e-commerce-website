import { HelpCircle, MessageSquare, Truck, CreditCard, RotateCcw, User, Package } from "lucide-react";

import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";

const faqSections = [
  {
    title: "Orders & Shipping",
    icon: Truck,
    questions: [
      {
        q: "How can I track my order?",
        a: "Once your order is placed, you'll receive a tracking number via email. You can also track your order anytime by visiting our Track Order page and entering your tracking number and email address.",
      },
      {
        q: "How long does shipping take?",
        a: "Standard shipping within Pakistan typically takes 3-5 business days. Orders placed before 2 PM are processed the same day. You'll receive a confirmation email with your tracking number once your order ships.",
      },
      {
        q: "Do you offer free shipping?",
        a: "Yes! We offer free shipping on all orders above Rs. 5,000. For orders below that, a flat delivery fee of Rs. 300 applies.",
      },
      {
        q: "Can I change or cancel my order after placing it?",
        a: "You can request order changes or cancellation within 1 hour of placing your order by contacting our support team. Once an order is being processed, changes may not be possible.",
      },
    ],
  },
  {
    title: "Payments",
    icon: CreditCard,
    questions: [
      {
        q: "What payment methods do you accept?",
        a: "We accept Cash on Delivery (COD), credit/debit cards (Visa, Mastercard), and bank transfers. All online payments are processed securely through Stripe.",
      },
      {
        q: "Is it safe to pay online?",
        a: "Absolutely. We use Stripe for all online transactions, which is PCI DSS compliant and uses industry-standard encryption. Your card details are never stored on our servers.",
      },
      {
        q: "What happens if my payment fails?",
        a: "If your payment fails, you won't be charged. You can retry the payment or choose a different payment method. Your order will remain in pending status until payment is confirmed.",
      },
    ],
  },
  {
    title: "Returns & Refunds",
    icon: RotateCcw,
    questions: [
      {
        q: "What is your return policy?",
        a: "We offer a 7-day return policy for most items. Products must be unused, in their original packaging, and in the same condition you received them. Certain items like personal care products are non-returnable.",
      },
      {
        q: "How do I initiate a return?",
        a: "Contact our support team with your order number and reason for return. We'll provide you with return instructions and, if applicable, a return shipping label.",
      },
      {
        q: "How long do refunds take?",
        a: "Once we receive and inspect your returned item, refunds are processed within 5-7 business days. The refund will be credited to your original payment method.",
      },
    ],
  },
  {
    title: "Account & Security",
    icon: User,
    questions: [
      {
        q: "Do I need an account to shop?",
        a: "No! We support guest checkout. You can place orders without creating an account. However, creating an account lets you track orders, save addresses, and manage your wishlist.",
      },
      {
        q: "How do I reset my password?",
        a: "Click 'Forgot Password' on the login page, enter your email address, and we'll send you a verification code to reset your password.",
      },
      {
        q: "How is my personal data protected?",
        a: "We take privacy seriously. Your data is encrypted, stored securely, and never shared with third parties. We only use your information to fulfill orders and improve your shopping experience.",
      },
    ],
  },
  {
    title: "Products & Availability",
    icon: Package,
    questions: [
      {
        q: "Are the product images accurate?",
        a: "We make every effort to display product colors and details as accurately as possible. However, slight variations may occur due to monitor settings and lighting conditions.",
      },
      {
        q: "What if a product is out of stock?",
        a: "If a product is out of stock, you can sign up for restock notifications on the product page. We'll email you as soon as it's available again.",
      },
      {
        q: "Do you offer product warranties?",
        a: "Warranty coverage varies by product and manufacturer. Warranty information is listed on individual product pages. Contact our support team for warranty claims.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <SiteHeader />

      <main className="flex-1">
        <section className="border-b bg-background">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              Help Center
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight">
              Frequently Asked Questions
            </h1>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              Find answers to common questions about orders, shipping, payments, and more.
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-8">
              {faqSections.map((section) => {
                const Icon = section.icon;
                return (
                  <div key={section.title}>
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100">
                        <Icon className="h-5 w-5 text-indigo-600" />
                      </div>
                      <h2 className="text-xl font-bold text-foreground">
                        {section.title}
                      </h2>
                    </div>

                    <div className="divide-y rounded-2xl border bg-white shadow-sm">
                      {section.questions.map((item) => (
                        <details key={item.q} className="group">
                          <summary className="flex cursor-pointer items-center justify-between gap-4 px-6 py-4 text-sm font-medium text-foreground transition hover:bg-muted/50">
                            <span>{item.q}</span>
                            <HelpCircle className="h-4 w-4 shrink-0 text-muted-foreground transition group-open:text-indigo-600" />
                          </summary>
                          <div className="px-6 pb-4 text-sm leading-6 text-muted-foreground">
                            {item.a}
                          </div>
                        </details>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-12 rounded-2xl border bg-indigo-50 p-8 text-center">
              <MessageSquare className="mx-auto h-8 w-8 text-indigo-600" />
              <h3 className="mt-4 text-lg font-bold text-foreground">
                Still have questions?
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Our support team is here to help. Reach out anytime.
              </p>
              <a
                href="/contact"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Contact Support
              </a>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
