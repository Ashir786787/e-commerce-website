"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { z } from "zod";
import { KeyRound, Link2, CheckCircle2 } from "lucide-react";

import api from "@/lib/api";
import OTPInput from "@/components/form/OTPInput";
import PasswordInput from "@/components/form/PasswordInput";
import SubmitButton from "@/components/form/SubmitButton";
import { Button } from "@/components/ui/button";
import GoogleLoginButton from "@/components/auth/GoogleLoginButton";

interface SettingsContentProps {
  email: string;
  googleId?: string | null;
  authProvider?: string;
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
  googleId,
  authProvider,
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

  const isGoogleLinked = !!googleId;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <section className="rounded-2xl border bg-background p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Link2 className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-xl font-semibold">
              Linked Accounts
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Connect your Google account for faster sign-in.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <div>
                <p className="text-sm font-medium">Google</p>
                <p className="text-xs text-muted-foreground">
                  {isGoogleLinked
                    ? `Linked (${authProvider === "google" ? "primary login" : "connected"})`
                    : "Not linked"}
                </p>
              </div>
            </div>

            {isGoogleLinked ? (
              <div className="flex items-center gap-1.5 text-sm text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
                Linked
              </div>
            ) : (
              <GoogleLoginButton mode="link" />
            )}
          </div>
        </div>
      </section>

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
