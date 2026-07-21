import { NextRequest } from "next/server";
import { addToWishlistController } from "@/controllers/wishlist.controller";

export async function POST(request: NextRequest) {
  return addToWishlistController(request);
}