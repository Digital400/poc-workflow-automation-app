import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a number as currency with thousand separators
 * @param value - The number to format
 * @param currency - The currency symbol (default: '$')
 * @returns Formatted currency string
 */
export function formatCurrency(value: number | null | undefined, currency: string = '$'): string {
  if (value == null) return `${currency}0.00`
  
  return `${currency}${value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`
}
