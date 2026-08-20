import { NextRequest } from "next/server";

import { connectDB } from "@/lib/db";
import { uploadImage } from "@/lib/cloudinary";
import { getCurrentUser } from "@/services/auth.service";
import Media from "@/models/Media";
import { errorResponse, successResponse } from "@/utils/api-response";

const MAX_FILE_SIZE = 4 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

export async function GET() {
  try {
    await connectDB();

    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "admin") {
      return errorResponse("Admin access is required.", 403);
    }

    const media = await Media.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return successResponse("Media fetched.", media);
  } catch (error) {
    console.error("Admin media list error:", error);
    return errorResponse("Unable to fetch media.", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "admin") {
      return errorResponse("Admin access is required.", 403);
    }

    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file");
      const filename = (formData.get("filename") as string) || "uploaded-image";

      if (!(file instanceof File)) {
        return errorResponse("No file was uploaded.", 400);
      }

      if (!ALLOWED_TYPES.includes(file.type)) {
        return errorResponse("Only JPG, PNG, WEBP, GIF or AVIF images are allowed.", 400);
      }

      if (file.size > MAX_FILE_SIZE) {
        return errorResponse("Image must be 4MB or smaller.", 400);
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const { url, publicId } = await uploadImage(buffer, "novacart/media");

      const media = await Media.create({
        url,
        publicId,
        filename: filename || file.name,
        uploadedBy: currentUser.id,
      });

      return successResponse("Image uploaded.", media.toObject());
    }

    const body = await request.json();

    if (!body.url || typeof body.url !== "string") {
      return errorResponse("A valid image URL is required.", 400);
    }

    const trimmedUrl = body.url.trim();

    const media = await Media.create({
      url: trimmedUrl,
      publicId: "",
      filename: body.filename || trimmedUrl.split("/").pop() || "external-image",
      uploadedBy: currentUser.id,
    });

    return successResponse("Image URL saved.", media.toObject());
  } catch (error) {
    console.error("Admin media upload error:", error);
    return errorResponse(error instanceof Error ? error.message : "Unable to upload image.", 500);
  }
}
