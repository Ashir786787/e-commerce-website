export const APP_NAME = "NovaCart";

export const DATABASE_NAME = "novacart";

export const USER_ROLES = {
  USER: "user",
  ADMIN: "admin",
} as const;

export const TOKEN_TYPES = {
  ACCESS: "access",
  VERIFY_EMAIL: "verify-email",
  RESET_PASSWORD: "reset-password",
} as const;
