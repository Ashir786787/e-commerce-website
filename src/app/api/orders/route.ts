import { NextRequest } from "next/server";

import {
  createOrderController,
  getUserOrdersController,
} from "@/controllers/order.controller";

export async function POST(request: NextRequest) {
  return createOrderController(request);
}

export async function GET() {
  return getUserOrdersController();
}
