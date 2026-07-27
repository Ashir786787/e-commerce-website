interface ContactMessageTemplateOptions {
  fullName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export function contactMessageTemplate({
  fullName,
  email,
  phone,
  subject,
  message,
}: ContactMessageTemplateOptions) {
  return `
    <div style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 40px;">
      <div style="max-width: 600px; margin: auto; background: white; border-radius: 12px; padding: 32px; border: 1px solid #e2e8f0;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #0f172a; margin: 0;">New Contact Message</h1>
          <p style="color: #64748b; font-size: 14px; margin-top: 8px;">Submitted via NovaCart Contact Form</p>
        </div>
        <div style="background-color: #f1f5f9; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 14px; width: 120px; vertical-align: top;">Name</td>
              <td style="padding: 8px 0; color: #0f172a; font-size: 14px; font-weight: bold;">${fullName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 14px; vertical-align: top;">Email</td>
              <td style="padding: 8px 0; color: #0f172a; font-size: 14px;"><a href="mailto:${email}" style="color: #2563eb;">${email}</a></td>
            </tr>
            ${phone ? `
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 14px; vertical-align: top;">Phone</td>
              <td style="padding: 8px 0; color: #0f172a; font-size: 14px;">${phone}</td>
            </tr>
            ` : ""}
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 14px; vertical-align: top;">Subject</td>
              <td style="padding: 8px 0; color: #0f172a; font-size: 14px; font-weight: bold;">${subject}</td>
            </tr>
          </table>
        </div>
        <div style="margin-bottom: 24px;">
          <p style="color: #64748b; font-size: 14px; margin-bottom: 8px;">Message:</p>
          <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; color: #334155; font-size: 15px; line-height: 1.6;">
            ${message.replace(/\n/g, "<br>")}
          </div>
        </div>
        <div style="text-align: center; padding-top: 16px; border-top: 1px solid #e2e8f0;">
          <p style="color: #94a3b8; font-size: 12px;">This message was sent from the NovaCart contact form.</p>
        </div>
      </div>
    </div>
  `;
}
