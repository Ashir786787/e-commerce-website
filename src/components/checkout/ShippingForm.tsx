"use client";

interface ShippingFormProps {
  shippingAddress: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  onChange: (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => void;
}

export default function ShippingForm({
  shippingAddress,
  onChange,
}: ShippingFormProps) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
          Delivery details
        </p>
        <h2 className="text-2xl font-semibold text-neutral-950">
          Shipping information
        </h2>
        <p className="mt-2 text-sm text-neutral-500">
          Enter the address where you want your order delivered.
        </p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label
            htmlFor="fullName"
            className="mb-2 block text-sm font-medium text-neutral-800"
          >
            Full Name
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            value={shippingAddress.fullName}
            onChange={onChange}
            placeholder="Enter your full name"
            autoComplete="name"
            required
            className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-neutral-800"
          >
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={shippingAddress.email}
            onChange={onChange}
            placeholder="you@example.com"
            autoComplete="email"
            required
            className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
          />
        </div>
        <div>
          <label
            htmlFor="phone"
            className="mb-2 block text-sm font-medium text-neutral-800"
          >
            Phone Number
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={shippingAddress.phone}
            onChange={onChange}
            placeholder="03XX XXXXXXX"
            autoComplete="tel"
            maxLength={11}
            inputMode="numeric"
            pattern="03[0-9]{9}"
            required
            className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
          />
          <p className="mt-1 text-xs text-neutral-400">
            11-digit Pakistani mobile number starting with 03
          </p>
        </div>
        <div className="sm:col-span-2">
          <label
            htmlFor="address"
            className="mb-2 block text-sm font-medium text-neutral-800"
          >
            Street Address
          </label>
          <input
            id="address"
            name="address"
            type="text"
            value={shippingAddress.address}
            onChange={onChange}
            placeholder="House number, street and area"
            autoComplete="street-address"
            required
            className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
          />
        </div>
        <div>
          <label
            htmlFor="city"
            className="mb-2 block text-sm font-medium text-neutral-800"
          >
            City
          </label>
          <input
            id="city"
            name="city"
            type="text"
            value={shippingAddress.city}
            onChange={onChange}
            placeholder="Lahore"
            autoComplete="address-level2"
            required
            className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
          />
        </div>
        <div>
          <label
            htmlFor="postalCode"
            className="mb-2 block text-sm font-medium text-neutral-800"
          >
            Postal Code
          </label>
          <input
            id="postalCode"
            name="postalCode"
            type="text"
            value={shippingAddress.postalCode}
            onChange={onChange}
            placeholder="54000"
            autoComplete="postal-code"
            required
            className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
          />
        </div>
        <div className="sm:col-span-2">
          <label
            htmlFor="country"
            className="mb-2 block text-sm font-medium text-neutral-800"
          >
            Country
          </label>
          <select
            id="country"
            name="country"
            value={shippingAddress.country}
            onChange={onChange}
            autoComplete="country-name"
            required
            className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm text-neutral-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
          >
            <option value="">Select a country</option>
            <option value="Pakistan">Pakistan</option>
          </select>
        </div>
      </div>
    </section>
  );
}
