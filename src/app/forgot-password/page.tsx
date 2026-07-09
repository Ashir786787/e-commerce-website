import AuthLayout from "@/components/layout/AuthLayout";
import AuthCard from "@/components/auth/AuthCard";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <AuthLayout>
      <AuthCard
        title="Forgot Password?"
        description="Enter your email address and we'll send you a password reset link."
      >
        <ForgotPasswordForm />
      </AuthCard>
    </AuthLayout>
  );
}