import BroadcastForm from "./BroadcastForm";

export const dynamic = "force-dynamic";

export default function AdminNotificationsPage() {
  return (
    <div>
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
          Notifications
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-950 sm:text-3xl">
          Promotional Notifications
        </h1>
        <p className="mt-1.5 text-neutral-600">
          Send push notifications to customers who enabled notifications.
        </p>
      </div>

      <BroadcastForm />
    </div>
  );
}
