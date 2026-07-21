import { NextRequest } from "next/server";
import { clearWishlistController } from "@/controllers/wishlist.controller";

export async function DELETE(request: NextRequest) {
  return clearWishlistController(request);
}