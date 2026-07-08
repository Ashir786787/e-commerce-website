import mongoose, { Schema, model, models } from "mongoose";
import { IUser } from "@/types/User";

const UserSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    avatar: {
      type: String,
      default: "",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    verificationToken: String,

    verificationTokenExpiry: Date,

    resetPasswordToken: String,

    resetPasswordExpiry: Date,
  },
  {
    timestamps: true,
  }
);

const User =
  models.User || model<IUser>("User", UserSchema);

export default User;
