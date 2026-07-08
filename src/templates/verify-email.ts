interface VerifyEmailTemplateOptions {
  fullName: string;
  verificationUrl: string;
}

export function verifyEmailTemplate({
  fullName,
  verificationUrl,
}: VerifyEmailTemplateOptions) {
  return `
    <div style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 40px;">
      <div style="max-width: 600px; margin: auto; background: white; border-radius: 12px; padding: 32px; border: 1px solid #e2e8f0;">
        <h1 style="color: #0f172a; margin-bottom: 16px;">Welcome to NovaCart</h1>

        <p style="color: #334155; font-size: 16px;">
          Hi ${fullName},
        </p>

        <p style="color: #334155; font-size: 16px;">
          Thank you for creating your NovaCart account. Please verify your email address to activate your account.
        </p>

        <a href="${verificationUrl}"
          style="display: inline-block; margin-top: 20px; background-color: #2563eb; color: white; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          Verify Email
        </a>

        <p style="color: #64748b; font-size: 14px; margin-top: 24px;">
          This verification link will expire in 1 hour.
        </p>

        <p style="color: #64748b; font-size: 14px;">
          If you did not create this account, you can safely ignore this email.
        </p>
      </div>
    </div>
  `;
}