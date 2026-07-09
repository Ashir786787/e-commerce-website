import { sendEmail } from "@/utils/email";
import { verifyEmailTemplate } from "@/templates/verify-email";
import { resetPasswordTemplate } from "@/templates/reset-password";

interface SendVerificationEmailOptions {
  fullName: string;
  email: string;
  token: string;
}

export async function sendVerificationEmail({
  fullName,
  email,
  token,
}: SendVerificationEmailOptions) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!appUrl) {
    throw new Error("NEXT_PUBLIC_APP_URL is not configured.");
  }

  const verificationUrl = `${appUrl}/verify-email?token=${token}`;

  await sendEmail({
    to: email,
    subject: "Verify your NovaCart account",
    html: verifyEmailTemplate({
      fullName,
      verificationUrl,
    }),
  });
}

interface SendResetPasswordEmailOptions {
  fullName: string;
  email: string;
  token: string;
}

export async function sendResetPasswordEmail({
  fullName,
  email,
  token,
}: SendResetPasswordEmailOptions) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

  const resetUrl = `${appUrl}/reset-password?token=${token}`;

  await sendEmail({
    to: email,
    subject: "Reset your NovaCart password",
    html: resetPasswordTemplate({
      fullName,
      resetUrl,
    }),
  });
}