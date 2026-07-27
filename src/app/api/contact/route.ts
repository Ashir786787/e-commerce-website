import { NextRequest } from "next/server";
import { contactFormSchema } from "@/validations/contact-form";
import { sendEmail } from "@/utils/email";
import { contactMessageTemplate } from "@/templates/contact-message";
import { successResponse, errorResponse } from "@/utils/api-response";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parsed = contactFormSchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message || "Invalid form data.";
      return errorResponse(message, 400);
    }

    const { fullName, email, phone, subject, message } = parsed.data;

    await sendEmail({
      to: process.env.EMAIL_USER!,
      subject: `[NovaCart Contact] ${subject}`,
      html: contactMessageTemplate({
        fullName,
        email,
        phone: phone || undefined,
        subject,
        message,
      }),
    });

    return successResponse("Your message has been sent successfully.");
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "Failed to send message. Please try again later.",
      500
    );
  }
}
