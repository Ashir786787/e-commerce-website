"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, LoaderCircle, XCircle } from "lucide-react";

type Status = "loading" | "success" | "error";

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    async function verifyEmail() {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");

      if (!token) {
        setStatus("error");
        setMessage("Verification token is missing.");
        return;
      }

      try {
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Verification failed.");
        }

        setStatus("success");
        setMessage("Your email has been verified successfully.");
      } catch (error) {
        setStatus("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "Invalid or expired verification link."
        );
      }
    }

    verifyEmail();
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <section className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm">
        <div className="mb-6 flex justify-center">
          {status === "loading" && (
            <LoaderCircle className="h-14 w-14 animate-spin text-primary" />
          )}

          {status === "success" && (
            <CheckCircle2 className="h-14 w-14 text-green-500" />
          )}

          {status === "error" && (
            <XCircle className="h-14 w-14 text-red-500" />
          )}
        </div>

        <h1 className="text-2xl font-bold">
          {status === "loading" && "Verifying Email"}
          {status === "success" && "Email Verified"}
          {status === "error" && "Verification Failed"}
        </h1>

        <p className="mt-3 text-sm text-muted-foreground">{message}</p>

        {status === "success" && (
          <Link
            href="/login"
            className="mt-6 inline-flex rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground"
          >
            Continue to Login
          </Link>
        )}

        {status === "error" && (
          <Link
            href="/signup"
            className="mt-6 inline-flex rounded-lg border px-5 py-3 text-sm font-medium"
          >
            Back to Signup
          </Link>
        )}
      </section>
    </main>
  );
}