export default function ContactHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50 via-white to-white">
      <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-indigo-100/40 blur-3xl" />
      <div className="absolute right-0 bottom-0 h-72 w-72 rounded-full bg-violet-100/40 blur-3xl" />
      <div className="relative mx-auto flex min-h-[50vh] max-w-7xl flex-col items-center justify-center px-6 py-24 text-center lg:px-8">
        <span className="rounded-full border border-indigo-200 bg-indigo-100 px-4 py-1 text-sm font-semibold uppercase tracking-[0.2em] text-indigo-700">
          Get In Touch
        </span>
        <h1 className="mt-8 max-w-4xl text-5xl font-bold tracking-tight text-gray-900 lg:text-7xl">
          We&apos;d Love to Hear
          <span className="block text-indigo-600">From You</span>
        </h1>
        <p className="mt-8 max-w-3xl pb-4 text-lg leading-8 text-gray-600">
          Have a question about your order, need help with a product, or want
          to share feedback? Our team is here to help and will get back to you
          as soon as possible.
        </p>
      </div>
    </section>
  );
}
