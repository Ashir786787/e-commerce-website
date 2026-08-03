import { NextRequest } from "next/server";

import { connectDB } from "@/lib/db";
import { uploadImage } from "@/lib/cloudinary";
import { getCurrentUser } from "@/services/auth.service";
import { errorResponse, successResponse } from "@/utils/api-response";

const MAX_FILE_SIZE = 4 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const currentUser = await getCurrentUser();

    if (!currentUser || currentUser.role !== "admin") {
      return errorResponse("Admin access is required.", 403);
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return errorResponse("No file was uploaded.", 400);
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return errorResponse(
        "Only JPG, PNG, WEBP, GIF or AVIF images are allowed.",
        400
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return errorResponse(
        "Image must be 4MB or smaller.",
        400
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const { url, publicId } = await uploadImage(buffer);

    return successResponse("Image uploaded.", {
      url,
      publicId,
    });
  } catch (error) {
    console.error("Admin image upload error:", error);

    return errorResponse(
      error instanceof Error
        ? error.message
        : "Unable to upload image.",
      500
    );
  }
}
