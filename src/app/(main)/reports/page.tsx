import { Suspense } from "react"
import { redirect } from "next/navigation"
import { format } from "date-fns"
import { db } from "@/lib/db"
import { CATEGORIES, getCurrentMonth } from "@/lib/utils"
import { getSession } from "@/lib/session"
import { getMonthRange, groupByCategory } from "@/lib/calculations"
import { ReportsPanel } from "@/components/reports/ReportsPanel"
import { MonthPicker } from "@/components/layout/MonthPicker"

export const metadata = { title: "Reports — Budget Tracker" }

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>
}) {
  const session = await getSession()
  if (!session?.user?.id) redirect("/login")

  const { month: monthParam } = await searchParams
  const month =
    monthParam && /^\d{4}-\d{2}$/.test(monthParam) ? monthParam : getCurrentMonth()
  const { monthStart, monthEnd } = getMonthRange(month)

  const userId = session.user.id
  const [year, mon] = month.split("-").map(Number)

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

  const spentByCategory = groupByCategory(expenses)
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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Reports</h1>
          <p className="text-stone-500 text-sm mt-1">
            {format(monthStart, "MMMM yyyy")} — monthly spending summary and trends
          </p>
        </div>
        <Suspense>
          <MonthPicker />
        </Suspense>
      </div>
      <ReportsPanel data={{ summary, trend }} month={month} />
    </div>
  )
}
