import { z } from "zod";

export const signupFormSchema = z.object({
  fullName: z.string().trim().min(3, "Name must be at least 3 characters.").max(50, "Name is too long."),
  email: z.email("Enter a valid email."),
  password: z.string().min(6, "Password must be at least 6 characters.").max(32, "Password is too long."),
});

export type SignupFormValues = z.infer<typeof signupFormSchema>;
