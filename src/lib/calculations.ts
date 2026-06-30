import { format } from "date-fns"

export function getMonthRange(month: string) {
  const [year, mon] = month.split("-").map(Number)
  return {
    monthStart: new Date(year, mon - 1, 1),
    monthEnd: new Date(year, mon, 1),
  }
}

export function groupByCategory(
  expenses: { category: string; amount: number }[],
): Record<string, number> {
  const result: Record<string, number> = {}
  for (const e of expenses) {
    result[e.category] = (result[e.category] ?? 0) + e.amount
  }
  return result
}

export function getMonthOptions(count = 12): { val: string; label: string }[] {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date()
    d.setDate(1)
    d.setMonth(d.getMonth() - i)
    return { val: format(d, "yyyy-MM"), label: format(d, "MMMM yyyy") }
  })
}
