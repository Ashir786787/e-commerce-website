import { sendEmail } from "@/utils/email";
import { verifyEmailTemplate } from "@/templates/verify-email";

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