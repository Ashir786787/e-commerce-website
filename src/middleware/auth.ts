import { cookies } from "next/headers";
import { verifyToken } from "@/utils/jwt";

export async function requireAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("novacart_token")?.value;

  if (!token) {
    throw new Error("Not authenticated.");
  }

  try {
    return verifyToken(token);
  } catch {
    throw new Error("Invalid or expired token.");
  }
}