import { GoogleGenAI } from "@google/genai";

export const GEMINI_MODEL =
  process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

export const GEMINI_FALLBACK_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-3.6-flash",
];

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

export class GeminiNotConfiguredError extends Error {
  constructor() {
    super("Gemini API key is not configured.");
    this.name = "GeminiNotConfiguredError";
  }
}

let client: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!isGeminiConfigured()) {
    throw new GeminiNotConfiguredError();
  }

  if (!client) {
    client = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY as string,
    });
  }

  return client;
}

function getErrorStatus(error: unknown): number | undefined {
  if (
    error &&
    typeof error === "object" &&
    "status" in error
  ) {
    const status = (error as { status?: unknown }).status;

    if (typeof status === "number") {
      return status;
    }
  }

  return undefined;
}

function isModelUnavailableError(error: unknown): boolean {
  if (getErrorStatus(error) === 404) {
    return true;
  }

  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();

  return (
    message.includes("not found") ||
    message.includes("does not exist") ||
    message.includes("model_not_found") ||
    message.includes("not supported") ||
    message.includes("unsupported model") ||
    message.includes("is not available") ||
    message.includes("permission_denied")
  );
}

function isTransientError(error: unknown): boolean {
  const status = getErrorStatus(error);

  if (
    status === 429 ||
    status === 408 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504
  ) {
    return true;
  }

  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();

  return (
    message.includes("high demand") ||
    message.includes("temporarily") ||
    message.includes("unavailable") ||
    message.includes("try again later") ||
    message.includes("rate limit")
  );
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface GeminiGenerationInput {
  contents: string;
  systemInstruction?: string;
  temperature?: number;
  maxOutputTokens?: number;
}

const TRANSIENT_RETRIES = 2;

export async function generateContentWithFallback(
  input: GeminiGenerationInput
): Promise<{ text?: string }> {
  const gemini = getGeminiClient();

  const models = [
    GEMINI_MODEL,
    ...GEMINI_FALLBACK_MODELS.filter((model) => model !== GEMINI_MODEL),
  ];

  let lastError: unknown = new Error(
    "Gemini model could not generate a response."
  );

  for (const model of models) {
    for (let attempt = 0; attempt <= TRANSIENT_RETRIES; attempt++) {
      try {
        const response = await gemini.models.generateContent({
          model,
          contents: input.contents,
          config: {
            systemInstruction: input.systemInstruction,
            temperature: input.temperature,
            maxOutputTokens: input.maxOutputTokens,
          },
        });

        return { text: response.text };
      } catch (error) {
        lastError = error;

        if (isModelUnavailableError(error)) {
          break;
        }

        if (getErrorStatus(error) === 429) {
          break;
        }

        if (!isTransientError(error)) {
          throw error;
        }

        if (attempt < TRANSIENT_RETRIES) {
          await delay(500 * (attempt + 1));
        }
      }
    }
  }

  throw lastError;
}
