interface ResetPasswordTemplateProps {
  fullName: string;
  resetUrl: string;
}

export function resetPasswordTemplate({
  fullName,
  resetUrl,
}: ResetPasswordTemplateProps) {
  return `
    <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto;">
      <h2>Password Reset Request</h2>

      <p>Hello <strong>${fullName}</strong>,</p>

      <p>We received a request to reset your NovaCart password.</p>

      <p>
        Click the button below to choose a new password:
      </p>

      <p>
        <a
          href="${resetUrl}"
          style="
            background:#2563eb;
            color:white;
            padding:12px 24px;
            text-decoration:none;
            border-radius:6px;
            display:inline-block;
          "
        >
          Reset Password
        </a>
      </p>

      <p>This link expires in <strong>1 hour</strong>.</p>

      <p>If you didn't request this, simply ignore this email.</p>

      <hr />

      <p>NovaCart Team</p>
    </div>
  `;
}
