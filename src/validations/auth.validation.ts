import { z } from "zod";

export const signupSchema = z.object({
  fullName: z.string().trim().min(3, "Full name must be at least 3 characters.").max(50, "Full name cannot exceed 50 characters."),
  email: z.email("Please enter a valid email address.").transform((email) => email.toLowerCase().trim()),
  password: z.string().min(6, "Password must be at least 6 characters.").max(32, "Password cannot exceed 32 characters."),
});

export const loginSchema = z.object({
  email: z.email("Please enter a valid email address.").transform((email) => email.toLowerCase().trim()),
  password: z.string().min(6, "Password is required."),
});

export const forgotPasswordSchema = z.object({
  email: z.email("Please enter a valid email address.").transform((email) => email.toLowerCase().trim()),
});

export const resetPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address.")
    .transform((email) => email.toLowerCase()),

  otp: z
    .string()
    .length(6, "OTP must be exactly 6 digits.")
    .regex(/^\d+$/, "OTP must contain only numbers."),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(32, "Password cannot exceed 32 characters."),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;