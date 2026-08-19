import { redirect } from "next/navigation";

import SettingsContent from "@/components/account/SettingsContent";
import { getCurrentUser } from "@/services/auth.service";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  let user;

  try {
    user = await getCurrentUser();
  } catch {
    redirect("/login");
  }

  return (
    <main className="flex-1">
        <section className="border-b bg-background">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Account</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight">Account Settings</h1>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              Update your password securely using a verification code sent to your email.
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SettingsContent
              email={user.email}
              googleId={user.googleId}
              authProvider={user.authProvider}
            />
          </div>
        </section>
      </main>
  );
}
