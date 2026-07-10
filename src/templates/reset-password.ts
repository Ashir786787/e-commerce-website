interface ResetPasswordTemplateProps {
  fullName: string;
  otp: string;
}

export function resetPasswordTemplate({
  fullName,
  otp,
}: ResetPasswordTemplateProps) {
  return `
    <div style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 40px;">
      <div style="max-width: 600px; margin: auto; background: white; border-radius: 12px; padding: 32px; border: 1px solid #e2e8f0;">
        <h1 style="color: #0f172a;">Reset your NovaCart password</h1>

        <p style="color: #334155; font-size: 16px;">
          Hi ${fullName},
        </p>

        <p style="color: #334155; font-size: 16px;">
          Use the 6-digit code below to reset your password.
        </p>

        <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2563eb; margin: 24px 0;">
          ${otp}
        </div>

        <p style="color: #64748b; font-size: 14px;">
          This code expires in 10 minutes.
        </p>

        <p style="color: #64748b; font-size: 14px;">
          If you did not request a password reset, you can safely ignore this email.
        </p>
      </div>
    </div>
  `;
}