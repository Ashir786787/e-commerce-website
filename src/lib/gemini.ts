import { GoogleGenAI } from "@google/genai";

export const GEMINI_MODEL =
  process.env.GEMINI_MODEL || "gemini-2.5-flash";

export const GEMINI_FALLBACK_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-flash",
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
  thinkingBudget?: number;
}

const TRANSIENT_RETRIES = 2;

const THINKING_MODEL_PREFIXES = ["gemini-2.5", "gemini-3"];

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
        const isThinkingModel = THINKING_MODEL_PREFIXES.some((p) => model.startsWith(p));

        const config: Record<string, unknown> = {
          systemInstruction: input.systemInstruction,
          temperature: input.temperature,
          maxOutputTokens: input.maxOutputTokens,
        };

        if (isThinkingModel && input.thinkingBudget !== undefined) {
          config.thinkingConfig = { thinkingBudget: input.thinkingBudget };
        }

        const response = await gemini.models.generateContent({
          model,
          contents: input.contents,
          config,
        });

        return { text: response.text };
      } catch (error) {
        lastError = error;

        if (isModelUnavailableError(error)) {
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
