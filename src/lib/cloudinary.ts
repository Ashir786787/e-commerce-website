import { v2 as cloudinary } from "cloudinary";
import type { UploadApiResponse } from "cloudinary";

export interface CloudinaryImage {
  url: string;
  publicId: string;
}

const CLOUDINARY_FOLDER = "novacart/products";

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

function getCloudinary() {
  if (!isCloudinaryConfigured()) {
    throw new Error(
      "Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET environment variables."
    );
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  return cloudinary;
}

export function uploadImage(
  buffer: Buffer,
  folder: string = CLOUDINARY_FOLDER
): Promise<CloudinaryImage> {
  const cloudinaryClient = getCloudinary();

  return new Promise<CloudinaryImage>((resolve, reject) => {
    const stream = cloudinaryClient.uploader.upload_stream(
      { folder, resource_type: "image", format: "auto" },
      (error, result) => {
        if (error || !result) {
          reject(error instanceof Error ? error : new Error("Cloudinary upload failed."));
          return;
        }

        resolve({ url: result.secure_url || result.url, publicId: result.public_id });
      }
    );

    stream.on("error", (streamError) => {
      reject(streamError);
    });

    stream.end(buffer);
  });
}

export async function deleteImage(publicId: string): Promise<void> {
  if (!publicId) {
    return;
  }

  const cloudinaryClient = getCloudinary();
  await cloudinaryClient.uploader.destroy(publicId, { resource_type: "image" });
}

export type { UploadApiResponse };
