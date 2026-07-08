import { signupUser } from "@/services/auth.service";
import { signupSchema } from "@/validations/auth.validation";

export async function register(body: unknown) {
  const validated = signupSchema.parse(body);
  return await signupUser(validated);
}
