import {
  signupUser,
  verifyEmail,
  loginUser,
  getCurrentUser,
  logoutUser,
  forgotPassword,
  resetPassword,
  resendOTP,
} from "@/services/auth.service";
import { successResponse, errorResponse } from "@/utils/api-response";
import { connectDB } from "@/lib/db";
import { cookies } from "next/headers";
import { signToken } from "@/utils/jwt";

export async function signupController(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const user = await signupUser(body);
    return successResponse("Account created", user, 201);
  } catch (error) {
    console.error(error);
    return errorResponse(error instanceof Error ? error.message : "Could not create account.", 400);
  }
}

export async function verifyEmailController(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    await verifyEmail(body);
    return successResponse("Email verified");
  } catch (error) {
    console.error(error);
    return errorResponse(error instanceof Error ? error.message : "Unable to verify email.", 400);
  }
}

export async function loginController(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const user = await loginUser(body);
    const token = signToken({ userId: user.id, role: user.role });
    const cookieStore = await cookies();
    cookieStore.set("novacart_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });
    return successResponse("Login successful", user, 200);
  } catch (error) {
    console.error(error);
    return errorResponse(error instanceof Error ? error.message : "Could not log in.", 400);
  }
}

export async function resendOTPController(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    await resendOTP(body);
    return successResponse("Verification code sent", null, 200);
  } catch (error) {
    console.error(error);
    return errorResponse(error instanceof Error ? error.message : "Unable to resend verification code.", 400);
  }
}

export async function forgotPasswordController(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    await forgotPassword(body);
    return successResponse("Password reset email sent", null, 200);
  } catch (error) {
    console.error(error);
    return errorResponse(error instanceof Error ? error.message : "Could not send reset email.", 400);
  }
}

export async function resetPasswordController(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    await resetPassword(body);
    return successResponse("Password reset", null, 200);
  } catch (error) {
    console.error(error);
    return errorResponse(error instanceof Error ? error.message : "Unable to reset password.", 400);
  }
}

export async function meController() {
  try {
    await connectDB();
    const user = await getCurrentUser();
    return successResponse("User loaded", user, 200);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load user.";
    return errorResponse(message, message === "Not authenticated." ? 401 : 500);
  }
}

export async function logoutController() {
  try {
    await logoutUser();
    return successResponse("Logged out", null, 200);
  } catch (error) {
    console.error(error);
    return errorResponse(error instanceof Error ? error.message : "Unable to log out.", 400);
  }
}
