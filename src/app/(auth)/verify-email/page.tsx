"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { toast } from "sonner";
import api from "@/lib/api";
import AuthLayout from "@/components/layout/AuthLayout";
import AuthCard from "@/components/auth/AuthCard";
import OTPInput from "@/components/form/OTPInput";
import SubmitButton from "@/components/form/SubmitButton";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [isResending, setIsResending] = useState(false);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      toast.error("Email is missing. Please signup again.");
      return;
    }

    if (otp.length !== 6) {
      toast.error("Please enter the 6-digit verification code.");
      return;
    }

    try {
      setIsSubmitting(true);

      await api.post("/auth/verify-email", {
        email,
        otp,
      });

      toast.success("Email verified successfully.");
      router.push("/login");
    } catch (error: unknown) {
      toast.error(
        error instanceof AxiosError
          ? error.response?.data?.message
          : "Invalid or expired verification code."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    if (resendTimer <= 0) return;

    const timer = setTimeout(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [resendTimer]);

  async function handleResendOTP() {
    if (!email) {
      toast.error("Email is missing. Please signup again.");
      return;
    }

    try {
      setIsResending(true);

      await api.post("/auth/resend-otp", { email });

      toast.success("New verification code sent.");
      setResendTimer(60);
    } catch (error: unknown) {
      toast.error(
        error instanceof AxiosError
          ? error.response?.data?.message
          : "Unable to resend verification code."
      );
    } finally {
      setIsResending(false);
    }
  }

  return (
    <AuthCard
      title="Verify your email"
      description={`Enter the 6-digit code sent to ${email || "your email"}.`}
    >
      <form onSubmit={handleVerify} className="space-y-6">
        <OTPInput value={otp} onChange={setOtp} />

        <SubmitButton isLoading={isSubmitting}>
          Verify Email
        </SubmitButton>

        <div className="text-center text-sm text-muted-foreground">
          {resendTimer > 0 ? (
            <p>Resend OTP in {resendTimer}s</p>
          ) : (
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={isResending}
              className="text-primary hover:underline disabled:opacity-50"
            >
              {isResending ? "Sending..." : "Resend OTP"}
            </button>
          )}
        </div>
      </form>
    </AuthCard>
  );
}

export default function VerifyEmailPage() {
  return (
    <AuthLayout>
      <Suspense
        fallback={
          <AuthCard title="Verify your email" description="Loading...">
            <div className="space-y-6" />
          </AuthCard>
        }
      >
        <VerifyEmailContent />
      </Suspense>
    </AuthLayout>
  );
}