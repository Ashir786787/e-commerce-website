import { NextRequest } from "next/server";

import { connectDB } from "@/lib/db";
import { deleteImage } from "@/lib/cloudinary";
import { getCurrentUser } from "@/services/auth.service";
import Media from "@/models/Media";
import { errorResponse, successResponse } from "@/utils/api-response";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "admin") {
      return errorResponse("Admin access is required.", 403);
    }

    const { id } = await params;

    const media = await Media.findById(id);
    if (!media) {
      return errorResponse("Media not found.", 404);
    }

    if (media.publicId) {
      try {
        await deleteImage(media.publicId);
      } catch {
        console.warn("Failed to delete from Cloudinary (may already be removed):", media.publicId);
      }
    }

    await Media.findByIdAndDelete(id);

    return successResponse("Media deleted.");
  } catch (error) {
    console.error("Admin media delete error:", error);
    return errorResponse(error instanceof Error ? error.message : "Unable to delete media.", 500);
  }
}
