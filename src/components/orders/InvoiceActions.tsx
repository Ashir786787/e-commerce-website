"use client";

import { Download, Printer } from "lucide-react";

export default function InvoiceActions() {
  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white px-5 text-sm font-semibold text-neutral-800 transition hover:border-indigo-300 hover:text-indigo-600"
      >
        <Printer className="h-4 w-4" />
        Print Invoice
      </button>

      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-700"
      >
        <Download className="h-4 w-4" />
        Save as PDF
      </button>
    </div>
  );
}
