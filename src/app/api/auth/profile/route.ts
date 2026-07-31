import { updateProfileController } from "@/controllers/auth.controller";

export async function PATCH(request: Request) {
  return updateProfileController(request);
}
