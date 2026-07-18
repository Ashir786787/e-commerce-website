import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());
import { connectDB } from "@/lib/db";
import User from "@/models/User";

async function deleteUser() {
  const email = process.argv[2];

  if (!email) {
    console.error("Usage: tsx src/scripts/deleteUser.ts <email>");
    process.exit(1);
  }

  try {
    await connectDB();

    const result = await User.deleteOne({ email: email.toLowerCase().trim() });

    if (result.deletedCount === 0) {
      console.log(`No user found with email: ${email}`);
    } else {
      console.log(`Deleted user: ${email}`);
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    process.exit(0);
  }
}

deleteUser();
