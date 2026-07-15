"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { toast } from "sonner";

import api from "@/lib/api";
import FormField from "@/components/form/FormField";
import PasswordInput from "@/components/form/PasswordInput";
import SubmitButton from "@/components/form/SubmitButton";
import {
  signupFormSchema,
  SignupFormValues,
} from "@/validations/signup-form";

export default function SignupForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
  });

  async function onSubmit(values: SignupFormValues) {
    try {
      await api.post("/auth/signup", {
        fullName: values.fullName,
        email: values.email,
        password: values.password,
      });

      toast.success("Account created. Check your email to verify.");
      router.push(`/verify-email?email=${encodeURIComponent(values.email)}`);
      router.refresh();
    } catch (error: unknown) {
      toast.error(
        error instanceof AxiosError
          ? error.response?.data?.message
          : "Signup failed. Please try again."
      );
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <FormField
        id="fullName"
        label="Full Name"
        placeholder="Muhammad Ashir"
        registration={register("fullName")}
        error={errors.fullName?.message}
      />
      <FormField
        id="email"
        label="Email"
        type="email"
        placeholder="you@example.com"
        registration={register("email")}
        error={errors.email?.message}
      />
      <PasswordInput
        id="password"
        label="Password"
        placeholder="Create a password"
        registration={register("password")}
        error={errors.password?.message}
      />
      <PasswordInput
        id="confirmPassword"
        label="Confirm Password"
        placeholder="Confirm your password"
        registration={register("confirmPassword")}
        error={errors.confirmPassword?.message}
      />
      <SubmitButton isLoading={isSubmitting}>
        Create Account
      </SubmitButton>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-primary hover:underline"
        >
          Login
        </Link>
      </p>
    </form>
  );
}
