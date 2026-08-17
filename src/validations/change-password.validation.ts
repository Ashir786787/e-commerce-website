import { z } from "zod";

export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(6, "Current password is required."),
  newPassword: z
    .string()
    .min(8, "New password must be at least 8 characters.")
    .max(32, "New password cannot exceed 32 characters."),
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
