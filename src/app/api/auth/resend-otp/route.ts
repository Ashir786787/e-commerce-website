import { resendOTPController } from "@/controllers/auth.controller";

export async function POST(request: Request) {
  return resendOTPController(request);
}
