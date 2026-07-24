import { NextRequest } from "next/server";

import { getOrderByIdController } from "@/controllers/order.controller";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: NextRequest,
  { params }: RouteContext
) {
  const { id } = await params;

  return getOrderByIdController(id);
}