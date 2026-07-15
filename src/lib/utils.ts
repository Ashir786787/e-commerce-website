import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getCategoryName(category: unknown, fallback?: string): string {
  if (typeof category === "object" && category !== null && "name" in category) {
    return String(category.name);
  }
  return fallback ?? "Uncategorized";
}

export function getCategorySlug(category: unknown): string {
  if (typeof category === "object" && category !== null && "slug" in category) {
    return String(category.slug);
  }
  return "";
}
