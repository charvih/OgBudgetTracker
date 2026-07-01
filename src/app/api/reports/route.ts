// This API returns a spending report for a given month along with six months of trend data.
// It calculates how much was spent in each category versus the budget, and also gathers
// historical totals so the front end can draw a trend chart.

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { CATEGORIES } from "@/lib/utils"
import { getMonthRange, groupByCategory } from "@/lib/calculations"

// Handles GET requests to fetch the monthly spending report and six-month trend data.
export async function GET(request: Request) {
  // Rejects the request with a 401 error if the user is not logged in.
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

  // Reads the month from the query string and validates its format.
  const { searchParams } = new URL(request.url)
  const month = searchParams.get("month") ?? ""

  if (!/^\d{4}-\d{2}$/.test(month)) {
    return Response.json({ error: "Invalid month format" }, { status: 400 })
  }

  const userId = session.user.id
  const { monthStart, monthEnd } = getMonthRange(month)
  const [year, mon] = month.split("-").map(Number)

  // Fetches expenses and budgets for the selected month at the same time.
  const [expenses, budgets] = await Promise.all([
    db.expense.findMany({
      where: { userId, date: { gte: monthStart, lt: monthEnd } },
      select: { amount: true, category: true },
    }),
    db.budget.findMany({
      where: { userId, month },
      select: { category: true, limit: true },
    }),
  ])

  // Groups expenses by category and builds a lookup table for budget limits.
  const spentByCategory = groupByCategory(expenses)
  const budgetByCategory: Record<string, number | null> = {}
  for (const b of budgets) {
    budgetByCategory[b.category] = b.limit
  }

  // Creates a summary row for every category including variance between budget and spending.
  const summary = CATEGORIES.map((cat) => {
    const spent = spentByCategory[cat] ?? 0
    const budget = budgetByCategory[cat] ?? null
    const variance = budget !== null ? budget - spent : null
    return { category: cat, spent, budget, variance }
  })

  // Fetches all expenses from the past six months to calculate monthly totals for the trend chart.
  const sixMonthsAgo = new Date(year, mon - 6, 1)
  const trendExpenses = await db.expense.findMany({
    where: { userId, date: { gte: sixMonthsAgo, lt: monthEnd } },
    select: { amount: true, date: true },
  })

  // Groups the historical expenses by month to get the total spent each month.
  const trendMap: Record<string, number> = {}
  for (const e of trendExpenses) {
    const m = `${e.date.getFullYear()}-${String(e.date.getMonth() + 1).padStart(2, "0")}`
    trendMap[m] = (trendMap[m] ?? 0) + e.amount
  }

  // Builds the six-month trend array in chronological order, using zero for months with no spending.
  const trend: { month: string; total: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(year, mon - 1 - i, 1)
    const trendMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    trend.push({ month: trendMonth, total: trendMap[trendMonth] ?? 0 })
  }

  return Response.json({ summary, trend })
}
