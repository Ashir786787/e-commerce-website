import { clearWishlistController } from "@/controllers/wishlist.controller";

export async function DELETE() {
  return clearWishlistController();
}
