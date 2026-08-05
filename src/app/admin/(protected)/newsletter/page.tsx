import { CheckCircle2, Mail, Users, XCircle } from "lucide-react";
import AdminPagination from "@/components/admin/AdminPagination";
import { connectDB } from "@/lib/db";
import Newsletter from "@/models/Newsletter";
import ToggleSubscriber from "./ToggleSubscriber";

export const dynamic = "force-dynamic";

function fmt(d: Date) {
  return new Intl.DateTimeFormat("en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(d));
}

interface AdminNewsletterPageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

export default async function AdminNewsletterPage({
  searchParams,
}: AdminNewsletterPageProps) {
  const { page: pageParam } = await searchParams;

  await connectDB();

  const limit = 15;
  const requestedPage = Math.max(1, Number(pageParam) || 1);

  const [totalSubscribers, activeSubscribers] = await Promise.all([
    Newsletter.countDocuments(),
    Newsletter.countDocuments({ subscribed: true }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalSubscribers / limit));
  const currentPage = Math.min(requestedPage, totalPages);
  const skip = (currentPage - 1) * limit;

  const subscribers = await Newsletter.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
            Newsletter
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-950 sm:text-3xl">
            Subscribers
          </h1>
          <p className="mt-1.5 text-neutral-600">
            Manage newsletter subscription requests.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <Users className="h-5 w-5 text-indigo-600" />
          <p className="mt-3 text-sm text-neutral-500">Total Subscribers</p>
          <p className="mt-1 text-xl font-bold text-neutral-950">
            {totalSubscribers}
          </p>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <p className="mt-3 text-sm text-neutral-500">Active</p>
          <p className="mt-1 text-xl font-bold text-emerald-600">
            {activeSubscribers}
          </p>
        </div>
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-neutral-200 bg-white shadow-sm">
        {subscribers.length > 0 ? (
          <table className="w-full min-w-[600px] border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                {["Email", "Status", "Subscribed", "Actions"].map((h) => (
                  <th
                    key={h}
                    className={`px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 ${h === "Subscribed" ? "text-right" : ""}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {subscribers.map((s) => (
                <tr
                  key={s._id.toString()}
                  className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50"
                >
                  <td className="px-5 py-4 font-medium text-neutral-950">
                    {s.email}
                  </td>
                  <td className="px-5 py-4">
                    {s.subscribed ? (
                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
                        <CheckCircle2 className="h-4 w-4" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-500">
                        <XCircle className="h-4 w-4" /> Unsubscribed
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right text-sm text-neutral-500">
                    {fmt(s.createdAt)}
                  </td>
                  <td className="px-5 py-4">
                    <ToggleSubscriber
                      id={s._id.toString()}
                      subscribed={s.subscribed}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <Mail className="h-12 w-12 text-neutral-300" />
            <p className="mt-4 text-lg font-semibold text-neutral-950">
              No subscribers yet
            </p>
            <p className="mt-2 text-sm text-neutral-500">
              Newsletter signups will appear here.
            </p>
          </div>
        )}
      </div>

      <AdminPagination
        currentPage={currentPage}
        totalPages={totalPages}
      />
    </div>
  );
}
