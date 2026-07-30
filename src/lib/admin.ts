import { redirect } from "next/navigation";

import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/services/auth.service";

export async function requireAdmin() {
  await connectDB();

  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "admin") {
      redirect("/");
    }

    return user;
  } catch {
    redirect("/login");
  }
}