import { z } from "zod";

export const resetPasswordFormSchema = z.object({
  token: z.string().min(1, "Token is required."),
  password: z.string().min(6, "Password must be at least 6 characters.").max(32, "Password is too long."),
});

export type ResetPasswordFormValues = z.infer<typeof resetPasswordFormSchema>;
