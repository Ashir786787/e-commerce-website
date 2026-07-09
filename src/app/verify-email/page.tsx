"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, LoaderCircle, XCircle } from "lucide-react";

import api from "@/lib/api";
import AuthLayout from "@/components/layout/AuthLayout";
import AuthCard from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/button";

type Status = "loading" | "success" | "error";

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    async function verifyEmail() {
      const params = new URLSearchParams(window.location.search);
      const otp = params.get("otp");

      if (!otp) {
        setStatus("error");
        setMessage("Verification code is missing.");
        return;
      }

      try {
        const response = await api.post("/auth/verify-email", {
          otp,
        });

        setStatus("success");
        setMessage(
          response.data?.message || "Your email has been verified successfully."
        );
      } catch (error: any) {
        setStatus("error");
        setMessage(
          error?.response?.data?.message ||
            "Invalid or expired verification link."
        );
      }
    }

    verifyEmail();
  }, []);

  return (
    <AuthLayout>
      <AuthCard
        title={
          status === "loading"
            ? "Verifying Email"
            : status === "success"
            ? "Email Verified"
            : "Verification Failed"
        }
        description={message}
      >
        <div className="space-y-6 text-center">
          <div className="flex justify-center">
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

          {status === "success" && (
            <Link href="/login">
              <Button className="w-full">Continue to Login</Button>
            </Link>
          )}

          {status === "error" && (
            <Link href="/signup">
              <Button variant="outline" className="w-full">Back to Signup</Button>
            </Link>
          )}
        </div>
      </AuthCard>
    </AuthLayout>
  );
}