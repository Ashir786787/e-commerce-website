import AuthLayout from "@/components/layout/AuthLayout";
import AuthCard from "@/components/auth/AuthCard";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <AuthLayout>
      <AuthCard
        title="Welcome back"
        description="Sign in to continue shopping with NovaCart."
      >
        <LoginForm />
      </AuthCard>
    </AuthLayout>
  );
}
