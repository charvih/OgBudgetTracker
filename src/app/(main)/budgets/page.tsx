// This page lets the user set a monthly spending limit for each expense category.
// It loads the current month's expenses and budgets from the database and passes them
// to the BudgetGrid component, which shows how much has been spent vs the set limit.

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

// Fetches expenses and budgets for the selected month and renders the budgets page.
export default async function BudgetsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>
}) {
  // Checks the session and redirects to login if the user is not signed in.
  const session = await getSession()
  if (!session?.user?.id) redirect("/login")

  // Reads the selected month from the URL, falling back to the current month.
  const { month: monthParam } = await searchParams
  const month =
    monthParam && /^\d{4}-\d{2}$/.test(monthParam) ? monthParam : getCurrentMonth()
  const { monthStart, monthEnd } = getMonthRange(month)

  const userId = session.user.id

  // Fetches both expenses and budgets at the same time for the selected month.
  const [expenses, budgets] = await Promise.all([
    db.expense.findMany({ where: { userId, date: { gte: monthStart, lt: monthEnd } } }),
    db.budget.findMany({ where: { userId, month } }),
  ])

  // Groups the expenses by category to calculate spending totals.
  const spentByCategory = groupByCategory(expenses)

  // Builds a lookup table of budget limits by category name.
  const budgetByCategory: Record<string, number | null> = {}
  for (const b of budgets) {
    budgetByCategory[b.category] = b.limit
  }

  // Creates one entry for every possible category, combining spending and budget data.
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
        {/* The month selector dropdown wrapped in Suspense to avoid blocking the page. */}
        <Suspense>
          <MonthPicker />
        </Suspense>
      </div>
      {/* The grid of budget cards — key forces a full re-render when the month changes. */}
      <BudgetGrid key={month} data={data} month={month} />
    </div>
  )
}
