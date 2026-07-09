import Link from "next/link";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-between">
        <div />

        <div>
          <div className="mb-8 text-center">
            <Link href="/" className="text-3xl font-bold tracking-tight">
              NovaCart
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">
              Smart Shopping. Simplified.
            </p>
          </div>

          {children}
        </div>

        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} NovaCart. All rights reserved.
        </p>
      </div>
    </main>
  );
}
