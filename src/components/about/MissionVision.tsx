import { Target, Eye } from "lucide-react";

export default function MissionVision() {
  return (
    <section className="bg-gray-50 py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
            Our Purpose
          </p>
          <h2 className="mt-4 text-4xl font-bold text-gray-900">
            Mission & Vision
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Everything we build at NovaCart is driven by
            our commitment to delivering an exceptional
            shopping experience.
          </p>
        </div>
        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          <div className="rounded-3xl border border-gray-200 bg-white p-10 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100">
              <Target className="h-8 w-8 text-indigo-600" />
            </div>
            <h3 className="mt-8 text-2xl font-bold text-gray-900">
              Our Mission
            </h3>
            <p className="mt-5 text-lg leading-8 text-gray-600">
              To provide customers with a secure,
              reliable and enjoyable shopping experience
              by offering premium products,
              transparent pricing and outstanding
              customer service.
            </p>
          </div>
          <div className="rounded-3xl border border-gray-200 bg-white p-10 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100">
              <Eye className="h-8 w-8 text-violet-600" />
            </div>
            <h3 className="mt-8 text-2xl font-bold text-gray-900">
              Our Vision
            </h3>
            <p className="mt-5 text-lg leading-8 text-gray-600">
              To become one of the most trusted online
              marketplaces by connecting people with
              quality products while continuously
              innovating the future of digital commerce.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
