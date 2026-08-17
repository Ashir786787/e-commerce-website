import { z } from "zod";

export const aiAssistantSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Message is required.")
    .max(
      1000,
      "Message cannot exceed 1000 characters."
    ),

  conversationId: z
    .string()
    .trim()
    .max(100)
    .optional(),

  history: z
    .array(
      z.object({
        role: z.enum([
          "user",
          "assistant",
        ]),
        content: z
          .string()
          .trim()
          .min(1)
          .max(2000),
      })
    )
    .max(10)
    .optional()
    .default([]),
});

export type AIAssistantInput =
  z.infer<typeof aiAssistantSchema>;