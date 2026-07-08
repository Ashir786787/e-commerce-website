import { verifyEmailController } from "@/controllers/auth.controller";

export async function POST(request: Request) {
  return verifyEmailController(request);
}