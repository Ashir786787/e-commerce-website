import User from "@/models/User";
import { hashPassword } from "@/utils/password";
import { signupSchema } from "@/validations/auth.validation";
import {
  generateToken,
  hashToken,
  generateExpiry,
} from "@/utils/token";
import { sendVerificationEmail } from "@/services/email.service";

interface SignupPayload {
  fullName: string;
  email: string;
  password: string;
}

export async function signupUser(data: SignupPayload) {
  // Validate input
  const validatedData = signupSchema.parse(data);

  // Check existing user
  const existingUser = await User.findOne({
    email: validatedData.email,
  });

  if (existingUser) {
    throw new Error("Email already exists.");
  }

  // Hash password
  const hashedPassword = await hashPassword(validatedData.password);

  // Create verification token
  const verificationToken = generateToken();
  const hashedVerificationToken = hashToken(verificationToken);
  const verificationTokenExpiry = generateExpiry(60);

  // Create user
  const user = await User.create({
    fullName: validatedData.fullName,
    email: validatedData.email,
    password: hashedPassword,
    verificationToken: hashedVerificationToken,
    verificationTokenExpiry,
  });

  // Send verification email
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
