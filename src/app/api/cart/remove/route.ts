import { NextRequest } from "next/server";
import { removeCartItemController } from "@/controllers/cart.controller";

export async function DELETE(request: NextRequest) {
  return removeCartItemController(request);
}
