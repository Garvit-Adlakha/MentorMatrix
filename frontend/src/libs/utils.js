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
  if (url.startsWith('data:') || url.includes('imagedelivery')) {
    return url;
  }
  
  // Example of simple optimization - add width parameter
  // In a real app, you'd use an image CDN or service like Cloudinary/Imgix
  try {
    const parsedUrl = new URL(url);
    parsedUrl.searchParams.append('w', width.toString());
    return parsedUrl.toString();
  } catch (e) {
    // If URL parsing fails, return original
    return url;
  }
};
