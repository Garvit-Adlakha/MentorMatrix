import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import moment from 'moment';

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

// Date and time formatting utilities using moment.js
export function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = moment(dateString);
  if (!date.isValid()) return 'Invalid date';
  return date.format('DD MMM YYYY');
}

export function formatTime(dateString) {
  if (!dateString) return '';
  const date = moment(dateString);
  if (!date.isValid()) return '';
  return date.format('hh:mm A');
}

export function formatRelativeDate(dateString) {
  if (!dateString) return '';
  const date = moment(dateString);
  if (!date.isValid()) return '';
  const today = moment('2025-04-23'); // Use current date context
  const tomorrow = moment('2025-04-23').add(1, 'days');
  if (date.isSame(today, 'day')) return `Today, ${date.format('hh:mm A')}`;
  if (date.isSame(tomorrow, 'day')) return `Tomorrow, ${date.format('hh:mm A')}`;
  return date.format('DD MMM YYYY, hh:mm A');
}
