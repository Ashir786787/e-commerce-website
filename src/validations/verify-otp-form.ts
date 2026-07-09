import { z } from "zod";

export const verifyOtpSchema = z.object({
  email: z.string().trim().email("Enter a valid email."),
  otp: z.string().length(6, "OTP must be exactly 6 digits.").regex(/^\d+$/, "OTP must contain only numbers."),
});

export type VerifyOtpValues = z.infer<typeof verifyOtpSchema>;
