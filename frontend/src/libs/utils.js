import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Utility functions for image optimization
export const getImagePlaceholder = () => 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YxZjVmOSIvPjwvc3ZnPg==';

export const getOptimizedImageUrl = (url, width = 400) => {
  if (!url) return null;
  
  // If it's already a data URL or optimized URL, return as is
  if (url.startsWith('data:') || url.includes('imagedelivery.net')) {
    return url;
  }
  
  // Otherwise, return the original URL
  // This is where you would implement your image optimization logic
  return url;
};
