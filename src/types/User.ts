export type UserRole = "user" | "admin";

export type AuthProvider = "local" | "google";

export interface IUser {
  fullName: string;
  email: string;
  password?: string;
  role: UserRole;
  isVerified: boolean;
  avatar?: string;
  fcmToken?: string;
  googleId?: string;
  authProvider?: AuthProvider;
  verificationOTP?: string;
  verificationOTPExpiry?: Date;
  resetPasswordOTP?: string;
  resetPasswordOTPExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}
