"use client";

import Image from "next/image";
import { useState } from "react";

interface CategoryImageProps {
  src: string;
  alt: string;
  sizes?: string;
  className?: string;
  fallback: React.ReactNode;
}

export default function CategoryImage({
  src,
  alt,
  sizes,
  className,
  fallback,
}: CategoryImageProps) {
  const [hasError, setHasError] = useState(false);

  const isValidSource = typeof src === "string" && /^https?:\/\//.test(src.trim());

  if (!isValidSource || hasError) {
    return <>{fallback}</>;
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      className={className}
      onError={() => setHasError(true)}
    />
  );
}
