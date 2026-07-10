import { sendEmail } from "@/utils/email";
import { verifyEmailTemplate } from "@/templates/verify-email";
import { resetPasswordTemplate } from "@/templates/reset-password";

interface SendVerificationEmailOptions {
  fullName: string;
  email: string;
  otp: string;
}

export async function sendVerificationEmail({
  fullName,
  email,
  otp,
}: SendVerificationEmailOptions) {
  await sendEmail({
    to: email,
    subject: "Your NovaCart verification code",
    html: verifyEmailTemplate({
      fullName,
      otp,
    }),
  });
}

interface SendResetPasswordEmailOptions {
  fullName: string;
  email: string;
  otp: string;
}

export async function sendResetPasswordEmail({
  fullName,
  email,
  otp,
}: SendResetPasswordEmailOptions) {
  await sendEmail({
    to: email,
    subject: "Your NovaCart password reset code",
    html: resetPasswordTemplate({
      fullName,
      otp,
    }),
  });
}