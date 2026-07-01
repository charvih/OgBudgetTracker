// This file stores shared helper functions and constants used throughout the whole app.
// It holds the list of spending categories, emoji icons for each category, and tools
// to format money, dates, and months into human-readable text.

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, formatDistanceToNow } from "date-fns"

// Combines CSS class names together, making the last one win if there are conflicts.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// The fixed list of spending categories that every expense and budget must belong to.
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

// A TypeScript type that represents any one of the allowed category names.
export type Category = (typeof CATEGORIES)[number]

// Maps each spending category to a matching emoji icon shown next to it in the app.
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

// Turns a plain number into a formatted Australian dollar amount like $12.50.
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(amount)
}

// Converts a date into a readable format like "25 Jun 2026".
export function formatDate(date: Date | string): string {
  return format(new Date(date), "dd MMM yyyy")
}

// Converts a date into a year-month string like "2026-06" used to filter data by month.
export function formatMonth(date: Date | string): string {
  return format(new Date(date), "yyyy-MM")
}

// Shows how long ago something happened, for example "3 hours ago" or "2 days ago".
export function formatRelativeTime(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

// Returns today's month in "YYYY-MM" format, used as the default month on every page.
export function getCurrentMonth(): string {
  return format(new Date(), "yyyy-MM")
}
