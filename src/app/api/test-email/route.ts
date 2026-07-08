import { sendEmail } from "@/utils/email";
import { successResponse, errorResponse } from "@/utils/api-response";

export async function GET() {
  try {
    await sendEmail({
      to: process.env.EMAIL_USER!,
      subject: "NovaCart Email Test",
      html: `
        <h2>NovaCart Email Test</h2>
        <p>Your email service is working successfully.</p>
      `,
    });

    return successResponse("Test email sent successfully.");
  } catch (error) {
    console.error(error);

    return errorResponse(
      error instanceof Error ? error.message : "Failed to send email.",
      500
    );
  }
}