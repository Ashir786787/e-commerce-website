import { getCartController } from "@/controllers/cart.controller";

export async function GET() {
  return getCartController();
}
