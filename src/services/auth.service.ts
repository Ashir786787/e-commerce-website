import { OAuth2Client } from "google-auth-library";
import User from "@/models/User";
import { hashPassword, comparePassword } from "@/utils/password";
import { signupSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, updateProfileSchema } from "@/validations/auth.validation";
import { generateOTP, hashToken, generateExpiry } from "@/utils/token";
import { sendVerificationEmail, sendResetPasswordEmail } from "@/services/email.service";
import { cookies } from "next/headers";
import { verifyToken } from "@/utils/jwt";

function getGoogleClientId() {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error("Google OAuth is not configured.");
  return clientId;
}

export async function signupUser(data: { fullName: string; email: string; password: string }) {
  const validatedData = signupSchema.parse(data);
  const existingUser = await User.findOne({ email: validatedData.email });
  if (existingUser) throw new Error("Email already exists.");

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

  await sendVerificationEmail({ fullName: user.fullName, email: user.email, otp: verificationOTP });
  return { id: user._id, fullName: user.fullName, email: user.email, isVerified: user.isVerified };
}

export async function verifyEmail(data: { email: string; otp: string }) {
  const hashedOTP = hashToken(data.otp);
  const user = await User.findOne({
    email: data.email.toLowerCase(),
    verificationOTP: hashedOTP,
    verificationOTPExpiry: { $gt: new Date() },
  });

  if (!user) throw new Error("Invalid or expired verification code.");

  user.isVerified = true;
  user.verificationOTP = undefined;
  user.verificationOTPExpiry = undefined;
  await user.save();
  return { id: user._id, fullName: user.fullName, email: user.email, isVerified: user.isVerified };
}

export async function resendOTP(data: { email: string }) {
  const email = data.email.toLowerCase().trim();
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found.");
  if (user.isVerified) throw new Error("Email is already verified.");

  const otp = generateOTP();
  user.verificationOTP = hashToken(otp);
  user.verificationOTPExpiry = generateExpiry(10);
  await user.save();

  await sendVerificationEmail({ fullName: user.fullName, email: user.email, otp });
  return { message: "Verification code sent successfully." };
}

export async function loginUser(data: { email: string; password: string }) {
  const validatedData = loginSchema.parse(data);
  const user = await User.findOne({ email: validatedData.email });
  if (!user) throw new Error("Invalid email or password.");
  if (!user.isVerified) throw new Error("Please verify your email before logging in.");
  if (!user.password) throw new Error("Invalid email or password.");

  const isPasswordCorrect = await comparePassword(validatedData.password, user.password);
  if (!isPasswordCorrect) throw new Error("Invalid email or password.");
  return { id: user._id, fullName: user.fullName, email: user.email, role: user.role, isVerified: user.isVerified };
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("novacart_token")?.value;
  if (!token) throw new Error("Not authenticated.");

  const decoded = verifyToken(token) as { userId: string; role: string };
  const user = await User.findById(decoded.userId).select("-password");
  if (!user) throw new Error("User not found.");
  return {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
    avatar: user.avatar || "",
    googleId: user.googleId || null,
    authProvider: user.authProvider || "local",
    createdAt: user.createdAt,
  };
}

export async function updateProfile(data: { fullName: string; avatar?: string }) {
  const validatedData = updateProfileSchema.parse(data);
  const currentUser = await getCurrentUser();
  const user = await User.findById(currentUser.id);
  if (!user) throw new Error("User not found.");

  user.fullName = validatedData.fullName;
  user.avatar = validatedData.avatar || "";
  await user.save();

  return {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
    avatar: user.avatar,
    createdAt: user.createdAt,
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

export async function forgotPassword(data: { email: string }) {
  const validatedData = forgotPasswordSchema.parse(data);
  const user = await User.findOne({ email: validatedData.email });
  if (!user) throw new Error("User not found.");

  const resetOTP = generateOTP();
  user.resetPasswordOTP = hashToken(resetOTP);
  user.resetPasswordOTPExpiry = generateExpiry(10);
  await user.save();

  await sendResetPasswordEmail({ fullName: user.fullName, email: user.email, otp: resetOTP });
}

export async function resetPassword(data: { email: string; otp: string; password: string }) {
  const validatedData = resetPasswordSchema.parse(data);
  const hashedOTP = hashToken(validatedData.otp);

  const user = await User.findOne({
    email: validatedData.email,
    resetPasswordOTP: hashedOTP,
    resetPasswordOTPExpiry: { $gt: new Date() },
  });

  if (!user) throw new Error("Invalid or expired password reset code.");

  user.password = await hashPassword(validatedData.password);
  user.resetPasswordOTP = undefined;
  user.resetPasswordOTPExpiry = undefined;
  await user.save();
}

export async function googleLogin(data: { idToken: string }) {
  const clientId = getGoogleClientId();
  const oAuth2Client = new OAuth2Client();

  let ticket;
  try {
    ticket = await oAuth2Client.verifyIdToken({
      idToken: data.idToken,
      audience: clientId,
    });
  } catch {
    throw new Error("Invalid Google authentication. Please try again.");
  }

  const payload = ticket.getPayload();
  if (!payload || !payload.email) {
    throw new Error("Could not retrieve Google account information.");
  }

  const googleEmail = payload.email.toLowerCase();
  const googleId = payload.sub;
  const googleName = payload.name || "";
  const googleAvatar = payload.picture || "";

  const existingUser = await User.findOne({
    $or: [{ email: googleEmail }, { googleId }],
  });

  if (existingUser) {
    if (!existingUser.googleId) {
      existingUser.googleId = googleId;
      existingUser.authProvider = "google";
    }
    if (!existingUser.avatar && googleAvatar) {
      existingUser.avatar = googleAvatar;
    }
    if (!existingUser.isVerified) {
      existingUser.isVerified = true;
    }
    await existingUser.save();

    return {
      id: existingUser._id,
      fullName: existingUser.fullName,
      email: existingUser.email,
      role: existingUser.role,
      isVerified: existingUser.isVerified,
    };
  }

  const newUser = await User.create({
    fullName: googleName || googleEmail.split("@")[0],
    email: googleEmail,
    avatar: googleAvatar,
    googleId,
    authProvider: "google",
    isVerified: true,
  });

  return {
    id: newUser._id,
    fullName: newUser.fullName,
    email: newUser.email,
    role: newUser.role,
    isVerified: newUser.isVerified,
  };
}

export async function linkGoogleAccount(userId: string, idToken: string) {
  const clientId = getGoogleClientId();
  const oAuth2Client = new OAuth2Client();

  let ticket;
  try {
    ticket = await oAuth2Client.verifyIdToken({
      idToken,
      audience: clientId,
    });
  } catch {
    throw new Error("Invalid Google authentication. Please try again.");
  }

  const payload = ticket.getPayload();
  if (!payload || !payload.email) {
    throw new Error("Could not retrieve Google account information.");
  }

  const googleId = payload.sub;
  const googleEmail = payload.email.toLowerCase();

  const existingUser = await User.findOne({
    $or: [{ email: googleEmail }, { googleId }],
    _id: { $ne: userId },
  });

  if (existingUser) {
    throw new Error("This Google account is already linked to another user.");
  }

  const user = await User.findById(userId);
  if (!user) throw new Error("User not found.");

  user.googleId = googleId;
  user.authProvider = "google";
  if (!user.avatar && payload.picture) {
    user.avatar = payload.picture;
  }
  await user.save();

  return { message: "Google account linked successfully." };
}
