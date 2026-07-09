import { z } from "zod";

export const signupFormSchema = z
  .object({
    fullName: z
      .string()
      .min(3, "Full name must be at least 3 characters.")
      .max(50, "Full name cannot exceed 50 characters."),

    email: z.string().trim().email("Enter a valid email."),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
      .regex(/[0-9]/, "Password must contain at least one number."),

    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type SignupFormValues = z.infer<typeof signupFormSchema>;