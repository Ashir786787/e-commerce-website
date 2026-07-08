import { signupUser, verifyEmail } from "@/services/auth.service";
import { successResponse, errorResponse } from "@/utils/api-response";
import { connectDB } from "@/lib/db";

export async function signupController(request: Request) {
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

    return errorResponse(
      error instanceof Error
        ? error.message
        : "Something went wrong.",
      400
    );
  }
}

export async function verifyEmailController(request: Request) {
  try {
    await connectDB();

    const { token } = await request.json();

    await verifyEmail(token);

    return successResponse(
      "Email verified successfully."
    );
  } catch (error) {
    console.error(error);

    return errorResponse(
      error instanceof Error
        ? error.message
        : "Something went wrong.",
      400
    );
  }
}