import User from "@/models/User";
import { hashPassword, comparePassword } from "@/utils/password";
import { signupSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from "@/validations/auth.validation";
import {
  generateToken,
  generateOTP,
  hashToken,
  generateExpiry,
} from "@/utils/token";
import { sendVerificationEmail, sendResetPasswordEmail } from "@/services/email.service";
import { cookies } from "next/headers";
import { verifyToken } from "@/utils/jwt";

interface SignupPayload {
  fullName: string;
  email: string;
  password: string;
}

export async function signupUser(data: SignupPayload) {
  const validatedData = signupSchema.parse(data);

  const existingUser = await User.findOne({
    email: validatedData.email,
  });

  if (existingUser) {
    throw new Error("Email already exists.");
  }

  const hashedPassword = await hashPassword(validatedData.password);

  const verificationOTP = generateOTP();
  const hashedVerificationOTP = hashToken(verificationOTP);
  const verificationOTPExpiry = generateExpiry(10);

  const user = await User.create({
    fullName: validatedData.fullName,
    email: validatedData.email,
    password: hashedPassword,
    verificationOTP: hashedVerificationOTP,
    verificationOTPExpiry,
  });

  await sendVerificationEmail({
    fullName: user.fullName,
    email: user.email,
    otp: verificationOTP,
  });

  return {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    isVerified: user.isVerified,
  };
}

interface VerifyEmailPayload {
  email: string;
  otp: string;
}

export async function verifyEmail(data: VerifyEmailPayload) {
  const hashedOTP = hashToken(data.otp);

  const user = await User.findOne({
    email: data.email.toLowerCase(),
    verificationOTP: hashedOTP,
    verificationOTPExpiry: {
      $gt: new Date(),
    },
  });

  if (!user) {
    throw new Error("Invalid or expired verification code.");
  }

  user.isVerified = true;
  user.verificationOTP = undefined;
  user.verificationOTPExpiry = undefined;

  await user.save();

  return {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    isVerified: user.isVerified,
  };
}

interface ResendOTPPayload {
  email: string;
}

export async function resendOTP(data: ResendOTPPayload) {
  const email = data.email.toLowerCase().trim();

  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("User not found.");
  }

  if (user.isVerified) {
    throw new Error("Email is already verified.");
  }

  const otp = generateOTP();

  user.verificationOTP = hashToken(otp);
  user.verificationOTPExpiry = generateExpiry(10);

  await user.save();

  await sendVerificationEmail({
    fullName: user.fullName,
    email: user.email,
    otp,
  });

  return {
    message: "Verification code sent successfully.",
  };
}

interface LoginPayload {
  email: string;
  password: string;
}

export async function loginUser(data: LoginPayload) {
  const validatedData = loginSchema.parse(data);

  const user = await User.findOne({
    email: validatedData.email,
  });

  if (!user) {
    throw new Error("Invalid email or password.");
  }

  if (!user.isVerified) {
    throw new Error("Please verify your email before logging in.");
  }

  const isPasswordCorrect = await comparePassword(
    validatedData.password,
    user.password
  );

  if (!isPasswordCorrect) {
    throw new Error("Invalid email or password.");
  }

  return {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
  };
}

export async function getCurrentUser() {
  const cookieStore = await cookies();

  const token = cookieStore.get("novacart_token")?.value;

  if (!token) {
    throw new Error("Not authenticated.");
  }

  const decoded = verifyToken(token) as {
    userId: string;
    role: string;
  };

  const user = await User.findById(decoded.userId).select("-password");

  if (!user) {
    throw new Error("User not found.");
  }

  return {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
  };
}

export async function logoutUser() {
  const cookieStore = await cookies();

  cookieStore.set("novacart_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

interface ForgotPasswordPayload {
  email: string;
}

export async function forgotPassword(
  data: ForgotPasswordPayload
) {
  const validatedData = forgotPasswordSchema.parse(data);

  const user = await User.findOne({
    email: validatedData.email,
  });

  if (!user) {
    throw new Error("User not found.");
  }

  const resetToken = generateToken();

  user.resetPasswordToken = hashToken(resetToken);
  user.resetPasswordExpiry = generateExpiry(60);

  await user.save();

  await sendResetPasswordEmail({
    fullName: user.fullName,
    email: user.email,
    token: resetToken,
  });
}

interface ResetPasswordPayload {
  token: string;
  password: string;
}

export async function resetPassword(
  data: ResetPasswordPayload
) {
  const validatedData = resetPasswordSchema.parse(data);

  const hashedToken = hashToken(validatedData.token);

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpiry: {
      $gt: new Date(),
    },
  });

  if (!user) {
    throw new Error("Invalid or expired reset token.");
  }

  user.password = await hashPassword(validatedData.password);

  user.resetPasswordToken = undefined;
  user.resetPasswordExpiry = undefined;

  await user.save();
}
