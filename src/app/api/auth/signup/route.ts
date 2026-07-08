import { signupController } from "@/controllers/auth.controller";

export async function POST(request: Request) {
  return signupController(request);
}