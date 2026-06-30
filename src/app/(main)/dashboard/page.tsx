import { Suspense } from "react"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { format } from "date-fns"
import { db } from "@/lib/db"
import { getCurrentMonth } from "@/lib/utils"
import { SpendingOverview } from "@/components/dashboard/SpendingOverview"
import { CategoryPieChart } from "@/components/dashboard/CategoryPieChart"
import { BudgetProgressBar } from "@/components/dashboard/BudgetProgressBar"
import { RecentExpenses } from "@/components/dashboard/RecentExpenses"
import { QuickAddButton } from "@/components/dashboard/QuickAddButton"
import { MonthPicker } from "@/components/layout/MonthPicker"

export const metadata = { title: "Dashboard — Budget Tracker" }

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const { month: monthParam } = await searchParams
  const month = monthParam ?? getCurrentMonth()

  const userId = session.user.id
  const [year, mon] = month.split("-").map(Number)
  const monthStart = new Date(year, mon - 1, 1)
  const monthEnd = new Date(year, mon, 1)

  const [expenses, budgets] = await Promise.all([
    db.expense.findMany({
      where: { userId, date: { gte: monthStart, lt: monthEnd } },
      orderBy: { date: "desc" },
    }),
    db.budget.findMany({ where: { userId, month } }),
  ])

  const spentByCategory: Record<string, number> = {}
  for (const e of expenses) {
    spentByCategory[e.category] = (spentByCategory[e.category] ?? 0) + e.amount
  }

  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0)
  const totalBudgeted = budgets.reduce((s, b) => s + b.limit, 0)

  const chartData = Object.entries(spentByCategory).map(([category, amount]) => ({
    category,
    amount,
  }))

  const budgetData = budgets.map((b) => ({
    category: b.category,
    limit: b.limit,
    spent: spentByCategory[b.category] ?? 0,
  }))

  const recentExpenses = expenses.slice(0, 5).map((e) => ({
    id: e.id,
    amount: e.amount,
    category: e.category,
    date: e.date.toISOString(),
    description: e.description,
  }))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Dashboard</h1>
          <p className="text-stone-500 text-sm mt-1">
            {format(monthStart, "MMMM yyyy")} overview
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Suspense>
            <MonthPicker />
          </Suspense>
          <QuickAddButton />
        </div>
      </div>

      <SpendingOverview totalSpent={totalSpent} totalBudgeted={totalBudgeted} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryPieChart data={chartData} />
        <RecentExpenses expenses={recentExpenses} />
      </div>

      {budgetData.length > 0 && <BudgetProgressBar budgets={budgetData} />}
    </div>
  )
}
