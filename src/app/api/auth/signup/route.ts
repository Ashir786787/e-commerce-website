import { connectDB } from "@/lib/db";
import { successResponse, errorResponse } from "@/utils/api-response";
import { signupUser } from "@/services/auth.service";

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();

    const user = await signupUser(body);

    return successResponse(
      "Account created successfully.",
      user,
      201
    );
  } catch (error) {
    console.error(error);

    const message =
      error instanceof Error
        ? error.message
        : "Something went wrong.";

    return errorResponse(message, 400);
  }
}
