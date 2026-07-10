"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import api from "@/lib/api";

import FormField from "@/components/form/FormField";
import SubmitButton from "@/components/form/SubmitButton";

import {
  forgotPasswordFormSchema,
  ForgotPasswordFormValues,
} from "@/validations/forgot-password-form";

export default function ForgotPasswordForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordFormSchema),
  });

  async function onSubmit(values: ForgotPasswordFormValues) {
    try {
      await api.post("/auth/forgot-password", values);

      toast.success("Password reset code sent successfully.");
      router.push(
        `/reset-password?email=${encodeURIComponent(values.email)}`
      );
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Unable to send password reset code."
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
    >
      <FormField
        id="email"
        label="Email"
        type="email"
        placeholder="you@example.com"
        registration={register("email")}
        error={errors.email?.message}
      />

      <SubmitButton isLoading={isSubmitting}>
        Send Reset Code
      </SubmitButton>

      <p className="text-center text-sm text-muted-foreground">
        Remember your password?{" "}
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