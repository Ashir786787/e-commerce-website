import { linkGoogleController } from "@/controllers/auth.controller";

export async function POST(request: Request) {
  return linkGoogleController(request);
}
