import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date consistently across server and client to prevent hydration errors
 * @param date Date to format
 * @param includeTime Whether to include time in the formatted date
 * @returns Formatted date string
 */
export function formatDate(date: Date | string | null | undefined, includeTime: boolean = false): string {
  if (!date) return "N/A";
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(d.getTime())) return "Invalid date";
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    timeZone: 'UTC', // Use UTC to avoid timezone issues
    ...(includeTime ? { hour: '2-digit', minute: '2-digit' } : {})
  };
  
  return d.toLocaleDateString('en-US', options);
}