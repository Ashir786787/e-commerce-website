export const authConfig = {
  secret: process.env.JWT_SECRET!,
  expiresIn: process.env.JWT_EXPIRES_IN || "7d",
};

if (!authConfig.secret) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}
