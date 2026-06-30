import { NextRequest } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { CATEGORIES } from "@/lib/utils"

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const month = searchParams.get("month") ?? ""

  if (!/^\d{4}-\d{2}$/.test(month)) {
    return Response.json({ error: "Invalid month format" }, { status: 400 })
  }

  const userId = session.user.id
  const [year, mon] = month.split("-").map(Number)
  const monthStart = new Date(year, mon - 1, 1)
  const monthEnd = new Date(year, mon, 1)

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

  const spentByCategory: Record<string, number> = {}
  for (const e of expenses) {
    spentByCategory[e.category] = (spentByCategory[e.category] ?? 0) + e.amount
  }
  const budgetByCategory: Record<string, number | null> = {}
  for (const b of budgets) {
    budgetByCategory[b.category] = b.limit
  }

  const summary = CATEGORIES.map((cat) => {
    const spent = spentByCategory[cat] ?? 0
    const budget = budgetByCategory[cat] ?? null
    const variance = budget !== null ? budget - spent : null
    return { category: cat, spent, budget, variance }
  })

  // Fetch all expenses in the 6-month window ending at monthEnd
  const sixMonthsAgo = new Date(year, mon - 6, 1)
  const trendExpenses = await db.expense.findMany({
    where: { userId, date: { gte: sixMonthsAgo, lt: monthEnd } },
    select: { amount: true, date: true },
  })

  const trendMap: Record<string, number> = {}
  for (const e of trendExpenses) {
    const m = `${e.date.getFullYear()}-${String(e.date.getMonth() + 1).padStart(2, "0")}`
    trendMap[m] = (trendMap[m] ?? 0) + e.amount
  }

  const trend: { month: string; total: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(year, mon - 1 - i, 1)
    const trendMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    trend.push({ month: trendMonth, total: trendMap[trendMonth] ?? 0 })
  }

  return Response.json({ summary, trend })
}
