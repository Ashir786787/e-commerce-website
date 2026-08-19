import { v2 as cloudinary } from "cloudinary";

export interface CloudinaryImage {
  url: string;
  publicId: string;
}

const CLOUDINARY_FOLDER = "novacart/products";

function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET
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
          const message =
            error instanceof Error
              ? error.message
              : typeof error === "object" && error !== null
                ? String((error as Record<string, unknown>).message || JSON.stringify(error))
                : String(error);
          reject(new Error(`Cloudinary: ${message}`));
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
