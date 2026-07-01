// This file contains small helper functions for working with dates and expense data.
// It helps calculate the start and end of a month, total spending per category,
// and a list of month options for dropdown menus.

import { format } from "date-fns"

// Returns the first and last moment of the given month as JavaScript Date objects.
export function getMonthRange(month: string) {
  const [year, mon] = month.split("-").map(Number)
  return {
    monthStart: new Date(year, mon - 1, 1),
    monthEnd: new Date(year, mon, 1),
  }
}

// Adds up all expense amounts grouped by category, returning a map of category name to total spent.
export function groupByCategory(
  expenses: { category: string; amount: number }[],
): Record<string, number> {
  const result: Record<string, number> = {}
  // Loops through each expense and adds its amount to the running total for its category.
  for (const e of expenses) {
    result[e.category] = (result[e.category] ?? 0) + e.amount
  }
  return result
}

// Builds a list of the most recent months (default 12) for use in month picker dropdowns.
export function getMonthOptions(count = 12): { val: string; label: string }[] {
  // Creates an array going back 'count' months from today, most recent first.
  return Array.from({ length: count }, (_, i) => {
    const d = new Date()
    d.setDate(1)
    d.setMonth(d.getMonth() - i)
    return { val: format(d, "yyyy-MM"), label: format(d, "MMMM yyyy") }
  })
}
