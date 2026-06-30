import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, formatDistanceToNow } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const CATEGORIES = [
  "Food & Dining",
  "Transport",
  "Shopping",
  "Entertainment",
  "Bills & Utilities",
  "Health & Medical",
  "Travel",
  "Education",
  "Other",
] as const

export type Category = (typeof CATEGORIES)[number]

export const CATEGORY_EMOJI: Record<Category, string> = {
  "Food & Dining": "🍔",
  "Transport": "🚗",
  "Shopping": "🛍️",
  "Entertainment": "🎭",
  "Bills & Utilities": "💡",
  "Health & Medical": "🏥",
  "Travel": "✈️",
  "Education": "📚",
  "Other": "📦",
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  return format(new Date(date), "dd MMM yyyy")
}

export function formatMonth(date: Date | string): string {
  return format(new Date(date), "yyyy-MM")
}

export function formatRelativeTime(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function getCurrentMonth(): string {
  return format(new Date(), "yyyy-MM")
}
