export type UserRole = "user" | "admin";

export interface IUser {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  isVerified: boolean;
  avatar?: string;
  verificationOTP?: string;
  verificationOTPExpiry?: Date;
  resetPasswordToken?: string;
  resetPasswordExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}
