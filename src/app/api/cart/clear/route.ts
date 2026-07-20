import { clearCartController } from "@/controllers/cart.controller";

export async function DELETE() {
  return clearCartController();
}
