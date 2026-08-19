import { Schema, model, models } from "mongoose";
import { IUser } from "@/types/User";

const UserSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true, trim: true, minlength: 3, maxlength: 50 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, minlength: 6, select: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    avatar: { type: String, default: "" },
    fcmToken: { type: String, default: "" },
    isVerified: { type: Boolean, default: false },
    googleId: { type: String, default: null },
    authProvider: { type: String, enum: ["local", "google"], default: "local" },
    verificationOTP: String,
    verificationOTPExpiry: Date,
    resetPasswordOTP: String,
    resetPasswordOTPExpiry: Date,
  },
  {
    timestamps: true,
  }
);

const User = models.User || model<IUser>("User", UserSchema);

export default User;
