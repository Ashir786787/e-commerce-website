import crypto from "crypto";

export function generateToken(length = 32): string {
  return crypto.randomBytes(length).toString("hex");
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function generateExpiry(minutes = 60): Date {
  return new Date(Date.now() + minutes * 60 * 1000);
}