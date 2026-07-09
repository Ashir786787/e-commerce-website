import AuthLayout from "@/components/layout/AuthLayout";
import AuthCard from "@/components/auth/AuthCard";
import SignupForm from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <AuthLayout>
      <AuthCard
        title="Create your account"
        description="Join NovaCart and start shopping today."
      >
        <SignupForm />
      </AuthCard>
    </AuthLayout>
  );
}