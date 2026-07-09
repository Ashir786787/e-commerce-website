"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import api from "@/lib/api";
import PasswordInput from "@/components/form/PasswordInput";
import SubmitButton from "@/components/form/SubmitButton";

import {
  resetPasswordFormSchema,
  ResetPasswordFormValues,
} from "@/validations/reset-password-form";

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordFormSchema),
  });

  async function onSubmit(values: ResetPasswordFormValues) {
    if (!token) {
      toast.error("Reset token is missing.");
      return;
    }

    try {
      await api.post("/auth/reset-password", {
        token,
        password: values.password,
      });

      toast.success("Password reset successfully. Please login.");
      router.push("/login");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Unable to reset password."
      );
    }
  }

  if (!token) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-red-500">
          Reset token is missing or invalid.
        </p>

        <Link href="/forgot-password" className="text-sm text-primary hover:underline">
          Request a new reset link
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
    </form>
  );
}