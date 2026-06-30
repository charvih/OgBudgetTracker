import { Suspense } from "react"
import { redirect } from "next/navigation"
import { format } from "date-fns"
import { db } from "@/lib/db"
import { CATEGORIES, getCurrentMonth } from "@/lib/utils"
import type { Category } from "@/lib/utils"
import { getSession } from "@/lib/session"
import { getMonthRange, groupByCategory } from "@/lib/calculations"
import { BudgetGrid } from "@/components/budgets/BudgetGrid"
import { MonthPicker } from "@/components/layout/MonthPicker"

export const metadata = { title: "Budgets — Budget Tracker" }

export default async function BudgetsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>
}) {
  const session = await getSession()
  if (!session?.user?.id) redirect("/login")

  const { month: monthParam } = await searchParams
  const month = monthParam ?? getCurrentMonth()
  const { monthStart, monthEnd } = getMonthRange(month)

  const userId = session.user.id

  const [expenses, budgets] = await Promise.all([
    db.expense.findMany({ where: { userId, date: { gte: monthStart, lt: monthEnd } } }),
    db.budget.findMany({ where: { userId, month } }),
  ])

  const spentByCategory = groupByCategory(expenses)

  const budgetByCategory: Record<string, number | null> = {}
  for (const b of budgets) {
    budgetByCategory[b.category] = b.limit
  }

  const data = CATEGORIES.map((cat) => ({
    category: cat as Category,
    spent: spentByCategory[cat] ?? 0,
    limit: budgetByCategory[cat] ?? null,
  }))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Budgets</h1>
          <p className="text-stone-500 text-sm mt-1">
            Set monthly limits for {format(monthStart, "MMMM yyyy")}
          </p>
        </div>
        <Suspense>
          <MonthPicker />
        </Suspense>
      </div>
      <BudgetGrid key={month} data={data} month={month} />
    </div>
  )
}
