import { Types } from "mongoose";

import { connectDB } from "@/lib/db";
import DiscountCode from "@/models/DiscountCode";

export function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function validateDiscountCode(code: string, userId: string) {
  await connectDB();
  const doc = await DiscountCode.findOne({ code: code.toUpperCase().trim() });
  if (!doc) throw new Error("Code not found");
  if (!doc.isActive) throw new Error("Discount code is no longer active");
  if (doc.expiresAt && doc.expiresAt < new Date()) throw new Error("Discount code has expired");
  if (doc.usedBy.some((e) => e.userId.toString() === userId)) throw new Error("You've already used this code");
  return { discountPercent: doc.discountPercent };
}

export async function markCodeUsed(code: string, userId: string) {
  await connectDB();
  await DiscountCode.findOneAndUpdate(
    { code: code.toUpperCase().trim(), "usedBy.userId": { $ne: new Types.ObjectId(userId) } },
    { $push: { usedBy: { userId: new Types.ObjectId(userId), usedAt: new Date() } } }
  );
}