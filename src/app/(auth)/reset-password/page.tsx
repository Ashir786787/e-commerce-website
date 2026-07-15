import { Suspense } from "react";

import AuthLayout from "@/components/layout/AuthLayout";
import AuthCard from "@/components/auth/AuthCard";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <AuthLayout>
      <AuthCard
        title="Reset Password"
        description="Enter the code sent to your email and set a new password."
      >
        <Suspense fallback={<p className="text-center text-sm">Loading...</p>}>
          <ResetPasswordForm />
        </Suspense>
      </AuthCard>
    </AuthLayout>
  );
}