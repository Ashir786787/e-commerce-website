"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { z } from "zod";
import { KeyRound } from "lucide-react";

import api from "@/lib/api";
import OTPInput from "@/components/form/OTPInput";
import PasswordInput from "@/components/form/PasswordInput";
import SubmitButton from "@/components/form/SubmitButton";
import { Button } from "@/components/ui/button";

interface SettingsContentProps {
  email: string;
}

const changePasswordFormSchema = z
  .object({
    otp: z
      .string()
      .length(6, "OTP must be exactly 6 digits.")
      .regex(/^\d+$/, "OTP must contain only numbers."),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(32, "Password cannot exceed 32 characters."),
    confirmPassword: z
      .string()
      .min(1, "Confirm password is required."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type ChangePasswordFormValues = z.infer<
  typeof changePasswordFormSchema
>;

export default function SettingsContent({
  email,
}: SettingsContentProps) {
  const [hasSentCode, setHasSentCode] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: {
      otp: "",
      password: "",
      confirmPassword: "",
    },
  });

  const otpValue = useWatch({ control, name: "otp" }) || "";

  useEffect(() => {
    if (resendTimer <= 0) return;

    const timer = setTimeout(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [resendTimer]);

  async function sendCode() {
    try {
      setIsSendingCode(true);

      await api.post("/auth/forgot-password", {
        email,
      });

      setHasSentCode(true);
      setResendTimer(60);
      toast.success(
        "Verification code sent to your email."
      );
    } catch (error: unknown) {
      toast.error(
        error instanceof AxiosError
          ? error.response?.data?.message
          : "Unable to send verification code."
      );
    } finally {
      setIsSendingCode(false);
    }
  }

  async function resendCode() {
    try {
      setIsResending(true);

      await api.post("/auth/forgot-password", {
        email,
      });

      setResendTimer(60);
      toast.success("New verification code sent.");
    } catch (error: unknown) {
      toast.error(
        error instanceof AxiosError
          ? error.response?.data?.message
          : "Unable to resend verification code."
      );
    } finally {
      setIsResending(false);
    }
  }

  async function onSubmit(values: ChangePasswordFormValues) {
    try {
      await api.post("/auth/reset-password", {
        email,
        otp: values.otp,
        password: values.password,
      });

      toast.success("Password changed successfully.");
      reset();
      setHasSentCode(false);
      setResendTimer(0);
    } catch (error: unknown) {
      toast.error(
        error instanceof AxiosError
          ? error.response?.data?.message
          : "Unable to change password."
      );
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <section className="rounded-2xl border bg-background p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <KeyRound className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-xl font-semibold">
              Change Password
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              We&apos;ll send a verification code to your
              email.
            </p>
          </div>
        </div>

        {!hasSentCode ? (
          <div className="mt-6">
            <Button
              type="button"
              className="w-full"
              onClick={sendCode}
              disabled={isSendingCode}
            >
              {isSendingCode
                ? "Sending Code..."
                : "Send Verification Code"}
            </Button>

            <p className="mt-4 text-sm text-muted-foreground">
              A 6-digit code will be sent to {email}. It
              expires in 10 minutes.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-6 space-y-5"
          >
            <div className="space-y-2">
              <p className="text-sm font-medium">
                6-Digit Verification Code
              </p>

              <OTPInput
                value={otpValue}
                onChange={(value) =>
                  setValue("otp", value, {
                    shouldValidate: true,
                  })
                }
              />

              {errors.otp?.message && (
                <p className="text-sm text-red-500">
                  {errors.otp.message}
                </p>
              )}
            </div>

            <PasswordInput
              id="newPassword"
              label="New Password"
              placeholder="Enter new password"
              registration={register("password")}
              error={errors.password?.message}
            />

            <PasswordInput
              id="confirmNewPassword"
              label="Confirm Password"
              placeholder="Confirm new password"
              registration={register("confirmPassword")}
              error={errors.confirmPassword?.message}
            />

            <SubmitButton isLoading={isSubmitting}>
              Change Password
            </SubmitButton>

            <div className="text-center text-sm text-muted-foreground">
              {resendTimer > 0 ? (
                <p>Resend code in {resendTimer}s</p>
              ) : (
                <button
                  type="button"
                  onClick={resendCode}
                  disabled={isResending}
                  className="text-primary hover:underline disabled:opacity-50"
                >
                  {isResending
                    ? "Sending..."
                    : "Resend Code"}
                </button>
              )}
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
