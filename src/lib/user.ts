import { cookies } from "next/headers";
import { Types } from "mongoose";
import { verifyToken } from "@/utils/jwt";

const GUEST_COOKIE = "novacart_guest_id";

export async function resolveUserId(): Promise<string> {
  const cookieStore = await cookies();
  const token = cookieStore.get("novacart_token")?.value;

  if (token) {
    try {
      const decoded = verifyToken(token) as { userId: string };
      return decoded.userId;
    } catch {
    }
  }

  let guestId = cookieStore.get(GUEST_COOKIE)?.value;

  if (!guestId || !Types.ObjectId.isValid(guestId)) {
    guestId = new Types.ObjectId().toString();
    cookieStore.set(GUEST_COOKIE, guestId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  return guestId;
}
