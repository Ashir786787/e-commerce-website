import { NextRequest } from "next/server";
import { removeFromWishlistController } from "@/controllers/wishlist.controller";

export async function DELETE(request: NextRequest) {
  return removeFromWishlistController(request);
}