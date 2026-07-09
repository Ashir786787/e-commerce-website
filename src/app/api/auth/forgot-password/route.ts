import { forgotPasswordController } from "@/controllers/auth.controller";

export async function POST(request: Request) {
  return forgotPasswordController(request);
}
