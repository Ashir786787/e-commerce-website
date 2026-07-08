import User from "@/models/User";
import { hashPassword } from "@/utils/password";
import { signupSchema } from "@/validations/auth.validation";

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

  // Create user
  const user = await User.create({
    fullName: validatedData.fullName,
    email: validatedData.email,
    password: hashedPassword,
  });

  return {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    isVerified: user.isVerified,
  };
}
