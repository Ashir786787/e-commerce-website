import crypto from "crypto";

/**
 * Generates a secure random token.
 */
export function generateToken(length = 32): string {
  return crypto.randomBytes(length).toString("hex");
}

/**
 * Hashes a token using SHA-256.
 */
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Returns an expiry date.
 * Default: 60 minutes
 */
export function generateExpiry(minutes = 60): Date {
  return new Date(Date.now() + minutes * 60 * 1000);
}