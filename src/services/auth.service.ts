import User from "@/models/User";
import { hashPassword, comparePassword } from "@/utils/password";
import { signupSchema, loginSchema } from "@/validations/auth.validation";
import {
  generateToken,
  hashToken,
  generateExpiry,
} from "@/utils/token";
import { sendVerificationEmail } from "@/services/email.service";
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

  const verificationToken = generateToken();
  const hashedVerificationToken = hashToken(verificationToken);
  const verificationTokenExpiry = generateExpiry(60);

  const user = await User.create({
    fullName: validatedData.fullName,
    email: validatedData.email,
    password: hashedPassword,
    verificationToken: hashedVerificationToken,
    verificationTokenExpiry,
  });

  await sendVerificationEmail({
    fullName: user.fullName,
    email: user.email,
    token: verificationToken,
  });

  return {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    isVerified: user.isVerified,
  };
}

export async function verifyEmail(token: string) {
  if (!token) {
    throw new Error("Verification token is required.");
  }

  const hashedToken = hashToken(token);

  const user = await User.findOne({
    verificationToken: hashedToken,
    verificationTokenExpiry: {
      $gt: new Date(),
    },
  });

  if (!user) {
    throw new Error("Invalid or expired verification token.");
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpiry = undefined;

  await user.save();

  return {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    isVerified: user.isVerified,
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
