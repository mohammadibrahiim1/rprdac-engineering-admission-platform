import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple Tailwind CSS class names safely with TypeScript support.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
