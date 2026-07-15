"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { toast } from "sonner";

import api from "@/lib/api";
import { loginFormSchema, LoginFormValues } from "@/validations/login-form";
import FormField from "@/components/form/FormField";
import PasswordInput from "@/components/form/PasswordInput";
import { Label } from "@/components/ui/label";
import SubmitButton from "@/components/form/SubmitButton";

export default function LoginForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
  });

  async function onSubmit(values: LoginFormValues) {
    try {
      await api.post("/auth/login", values);

      toast.success("Login successful.");
      router.push("/");
      router.refresh();
    } catch (error: unknown) {
      toast.error(
        error instanceof AxiosError
          ? error.response?.data?.message
          : "Login failed. Please try again."
      );
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <FormField
        id="email"
        label="Email"
        type="email"
        placeholder="you@example.com"
        registration={register("email")}
        error={errors.email?.message}
      />
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link href="/forgot-password" className="text-sm text-primary hover:underline">
            Forgot password?
          </Link>
        </div>
        <PasswordInput
          id="password"
          label=""
          placeholder="Enter your password"
          registration={register("password")}
          error={errors.password?.message}
        />
      </div>
      <SubmitButton isLoading={isSubmitting}>
        Login
      </SubmitButton>
      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-primary hover:underline">
          Create account
        </Link>
      </p>
    </form>
  );
}