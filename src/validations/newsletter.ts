import { z } from "zod";

export const newsletterSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address.")
    .transform((email) => email.toLowerCase()),
});

export type NewsletterInput = z.infer<typeof newsletterSchema>;
