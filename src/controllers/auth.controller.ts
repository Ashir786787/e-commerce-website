import { NextResponse } from "next/server";
import {
  signupUser,
  verifyEmail,
  loginUser,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  resendOTP,
  updateProfile,
} from "@/services/auth.service";
import { successResponse, errorResponse } from "@/utils/api-response";
import { connectDB } from "@/lib/db";
import { signToken } from "@/utils/jwt";

export async function signupController(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const user = await signupUser(body);
    return successResponse("Account created", user, 201);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Signup failed.", 400);
  }
}

export async function verifyEmailController(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    await verifyEmail(body);
    return successResponse("Email verified");
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Verification failed.", 400);
  }
}

export async function loginController(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const user = await loginUser(body);
    const token = signToken({ userId: user.id, role: user.role });

    const response = NextResponse.json(
      {
        success: true,
        message: "Login successful",
        data: user,
      },
      { status: 200 }
    );

    response.cookies.set("novacart_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Login failed.", 400);
  }
}

export async function resendOTPController(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    await resendOTP(body);
    return successResponse("Verification code sent", null, 200);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Failed to send code.", 400);
  }
}

export async function forgotPasswordController(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    await forgotPassword(body);
    return successResponse("Password reset email sent", null, 200);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Could not send reset email.";
    return errorResponse(msg, 400);
  }
}

export async function resetPasswordController(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    await resetPassword(body);
    return successResponse("Password reset", null, 200);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Password reset failed.", 400);
  }
}

export async function meController() {
  try {
    await connectDB();
    const user = await getCurrentUser();
    return successResponse("User loaded", user, 200);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to load user.";
    return errorResponse(msg, msg === "Not authenticated." ? 401 : 500);
  }
}

export async function updateProfileController(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const user = await updateProfile(body);
    return successResponse("Profile updated", user, 200);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to update profile.";
    return errorResponse(msg, msg === "Not authenticated." ? 401 : 400);
  }
}

export async function logoutController() {
  try {
    const response = NextResponse.json(
      {
        success: true,
        message: "Logged out",
        data: null,
      },
      { status: 200 }
    );

    response.cookies.set("novacart_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch {
    return errorResponse("Logout failed.", 400);
  }
}
