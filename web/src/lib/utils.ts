import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merge Tailwind classes with conflict resolution.
 * Required by every RetroUI/shadcn component (`@/lib/utils`).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
