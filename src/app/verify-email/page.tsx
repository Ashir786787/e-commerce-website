"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Invalid or expired verification code."
      );
    } finally {
      setIsSubmitting(false);
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