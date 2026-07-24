import { getWishlistController } from "@/controllers/wishlist.controller";

export async function GET() {
  return getWishlistController();
}
