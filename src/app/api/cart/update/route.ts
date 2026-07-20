import { NextRequest } from "next/server";

import { updateCartItemController } from "@/controllers/cart.controller";

export async function PATCH(request: NextRequest) {
  return updateCartItemController(request);
}
