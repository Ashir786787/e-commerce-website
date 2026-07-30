import { CheckCircle2, Clock, Tag, XCircle } from "lucide-react";
import { connectDB } from "@/lib/db";
import DiscountCode from "@/models/DiscountCode";
import GenerateCodesForm from "./GenerateCodesForm";

export const dynamic = "force-dynamic";

function fmt(d: Date | undefined) {
  return d ? new Intl.DateTimeFormat("en-PK", { dateStyle: "medium" }).format(new Date(d)) : "—";
}

function badge(active: boolean, expiresAt: Date | undefined) {
  if (!active) return { label: "Inactive", icon: XCircle, color: "text-red-700" };
  if (expiresAt && new Date(expiresAt) < new Date()) return { label: "Expired", icon: Clock, color: "text-amber-700" };
  return { label: "Active", icon: CheckCircle2, color: "text-emerald-700" };
}

export default async function AdminDiscountCodesPage() {
  await connectDB();
  const codes = await DiscountCode.find().sort({ createdAt: -1 }).lean();
  const now = new Date();
  const active = codes.filter((c) => c.isActive && (!c.expiresAt || new Date(c.expiresAt) > now));
  const totalUsed = codes.reduce((s, c) => s + c.usedBy.length, 0);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Discounts</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">Discount Codes</h1>
          <p className="mt-3 text-neutral-600">Generate and manage promotional codes.</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-neutral-500">Total Codes</p>
          <p className="mt-3 text-3xl font-bold text-neutral-950">{codes.length}</p>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-neutral-500">Active</p>
          <p className="mt-3 text-3xl font-bold text-emerald-600">{active.length}</p>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-neutral-500">Times Used</p>
          <p className="mt-3 text-3xl font-bold text-indigo-600">{totalUsed}</p>
        </div>
      </div>

      <GenerateCodesForm />

      <div className="mt-8 overflow-x-auto rounded-2xl border border-neutral-200 bg-white shadow-sm">
        {codes.length > 0 ? (
          <table className="w-full min-w-[700px] border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                {["Code", "Discount", "Status", "Uses", "Expires", "Created"].map((h) => (
                  <th key={h} className={`px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 ${h === "Created" ? "text-right" : ""}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {codes.map((c) => {
                const st = badge(c.isActive, c.expiresAt);
                const Icon = st.icon;
                return (
                  <tr key={c._id.toString()} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                    <td className="px-5 py-4"><code className="rounded-md bg-neutral-100 px-2 py-1 font-mono text-sm font-semibold text-neutral-900">{c.code}</code></td>
                    <td className="px-5 py-4"><span className="font-semibold text-neutral-950">{c.discountPercent}%</span></td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-sm font-semibold ${st.color}`}><Icon className="h-4 w-4" />{st.label}</span>
                    </td>
                    <td className="px-5 py-4 text-sm text-neutral-600">{c.usedBy.length > 0 ? `${c.usedBy.length} time${c.usedBy.length > 1 ? "s" : ""}` : "Never used"}</td>
                    <td className="px-5 py-4 text-sm text-neutral-600">{fmt(c.expiresAt)}</td>
                    <td className="px-5 py-4 text-right text-sm text-neutral-500">{fmt(c.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <Tag className="h-12 w-12 text-neutral-300" />
            <p className="mt-4 text-lg font-semibold text-neutral-950">No codes yet</p>
            <p className="mt-2 text-sm text-neutral-500">Generate your first batch above.</p>
          </div>
        )}
      </div>
    </div>
  );
}