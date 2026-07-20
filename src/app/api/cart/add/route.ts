import { NextRequest } from "next/server";

import { addToCartController } from "@/controllers/cart.controller";

export async function POST(request: NextRequest) {
  return addToCartController(request);
}