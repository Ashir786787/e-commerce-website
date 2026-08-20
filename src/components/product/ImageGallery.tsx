"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ImageGalleryImage {
  url: string;
  publicId?: string;
}

interface ImageGalleryProps {
  images: ImageGalleryImage[];
  productName: string;
  discount?: number;
}

const FALLBACK_IMAGE =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSb7tmMiL9Bn2X8Iz5teTECetBoux8iSfOPd__XhLC0lw&s=10";

export default function ImageGallery({
  images,
  productName,
  discount,
}: ImageGalleryProps) {
  const allImages =
    images.length > 0
      ? images
      : [{ url: FALLBACK_IMAGE }];

  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="flex flex-col-reverse gap-3 lg:flex-row lg:gap-4">
      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:pb-0">
          {allImages.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={cn(
                "relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all sm:h-20 sm:w-20",
                i === activeIndex
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-transparent opacity-60 hover:opacity-100"
              )}
            >
              <Image
                src={img.url}
                alt={`${productName} thumbnail ${i + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      <div className="relative flex-1 overflow-hidden rounded-2xl bg-muted lg:rounded-3xl">
        <div className="relative aspect-square">
          <Image
            src={allImages[activeIndex].url}
            alt={productName}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
            className="object-cover transition-opacity duration-200"
          />
        </div>
        {discount && discount > 0 && (
          <span className="absolute left-4 top-4 rounded-full bg-red-600 px-3 py-1.5 text-xs font-bold text-white shadow-lg sm:text-sm">
            -{discount}%
          </span>
        )}
        {allImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {activeIndex + 1} / {allImages.length}
          </div>
        )}
      </div>
    </div>
  );
}
