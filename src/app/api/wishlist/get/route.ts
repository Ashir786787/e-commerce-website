import { NextRequest } from "next/server";
import { getWishlistController } from "@/controllers/wishlist.controller";

export async function GET(request: NextRequest) {
  return getWishlistController(request);
}