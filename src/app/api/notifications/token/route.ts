import { NextRequest } from "next/server";

import { saveNotificationTokenController } from "@/controllers/notification.controller";

export async function POST(
  request: NextRequest
) {
  return saveNotificationTokenController(request);
}
