import { googleLoginController } from "@/controllers/auth.controller";

export async function POST(request: Request) {
  return googleLoginController(request);
}
