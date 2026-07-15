"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { toast } from "sonner";

import api from "@/lib/api";
import FormField from "@/components/form/FormField";
import PasswordInput from "@/components/form/PasswordInput";
import SubmitButton from "@/components/form/SubmitButton";

import {
  resetPasswordFormSchema,
  ResetPasswordFormValues,
} from "@/validations/reset-password-form";

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: {
      email,
      otp: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: ResetPasswordFormValues) {
    try {
      await api.post("/auth/reset-password", {
        email: values.email,
        otp: values.otp,
        password: values.password,
      });

      toast.success("Password reset successfully. Please login.");
      router.push("/login");
    } catch (error: unknown) {
      toast.error(
        error instanceof AxiosError
          ? error.response?.data?.message
          : "Unable to reset password."
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
      <FormField
        id="otp"
        label="6-Digit Verification Code"
        type="text"
        placeholder="Enter the code"
        registration={register("otp")}
        error={errors.otp?.message}
      />
      <PasswordInput
        id="password"
        label="New Password"
        placeholder="Enter new password"
        registration={register("password")}
        error={errors.password?.message}
      />
      <PasswordInput
        id="confirmPassword"
        label="Confirm Password"
        placeholder="Confirm new password"
        registration={register("confirmPassword")}
        error={errors.confirmPassword?.message}
      />
      <SubmitButton isLoading={isSubmitting}>
        Reset Password
      </SubmitButton>
      <p className="text-center text-sm text-muted-foreground">
        Didn&apos;t receive the code?{" "}
        <Link
          href="/forgot-password"
          className="text-primary hover:underline"
        >
          Request another code
        </Link>
      </p>
    </form>
  );
}