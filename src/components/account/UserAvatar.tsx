"use client";

import { useState } from "react";

interface UserAvatarProps {
  name: string;
  avatar?: string;
  className?: string;
}

export default function UserAvatar({
  name,
  avatar,
  className = "h-20 w-20 text-2xl",
}: UserAvatarProps) {
  const [hasError, setHasError] = useState(false);

  const isValidSource = typeof avatar === "string" && avatar.trim().length > 0;

  if (!isValidSource || hasError) {
    return (
      <div
        className={`flex items-center justify-center rounded-full bg-indigo-600 font-bold text-white ${className}`}
      >
        {name.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={avatar}
      alt={name}
      onError={() => setHasError(true)}
      className={`rounded-full object-cover ${className}`}
    />
  );
}
