import { z } from "zod";

export const resetPasswordFormSchema = z
  .object({
    email: z.string().trim().email("Enter a valid email address."),
    otp: z.string().length(6, "OTP must be exactly 6 digits.").regex(/^\d+$/, "OTP must contain only numbers."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(1, "Confirm password is required."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordFormSchema>;