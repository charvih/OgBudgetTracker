// This is the main dashboard page that shows the user an overview of their spending for the month.
// It fetches expenses and budgets from the database on the server, then passes the data to chart
// and summary components to display totals, a category breakdown, and budget progress.

import { Suspense } from "react"
import { redirect } from "next/navigation"
import { format } from "date-fns"
import { db } from "@/lib/db"
import { getCurrentMonth } from "@/lib/utils"
import { getSession } from "@/lib/session"
import { getMonthRange, groupByCategory } from "@/lib/calculations"
import { SpendingOverview } from "@/components/dashboard/SpendingOverview"
import { CategoryPieChart } from "@/components/dashboard/CategoryPieChart"
import { BudgetProgressBar } from "@/components/dashboard/BudgetProgressBar"
import { RecentExpenses } from "@/components/dashboard/RecentExpenses"
import { QuickAddButton } from "@/components/dashboard/QuickAddButton"
import { MonthPicker } from "@/components/layout/MonthPicker"

export const metadata = { title: "Dashboard — Budget Tracker" }

// Fetches all data needed for the dashboard and renders the page.
export default async function DashboardPage({
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

  // Fetches the user's expenses and budgets for the selected month at the same time.
  const [expenses, budgets] = await Promise.all([
    db.expense.findMany({
      where: { userId, date: { gte: monthStart, lt: monthEnd } },
      orderBy: { date: "desc" },
    }),
    db.budget.findMany({ where: { userId, month } }),
  ])

  // Groups all expenses by category to calculate how much was spent in each area.
  const spentByCategory = groupByCategory(expenses)

  // Calculates the overall totals for the spending overview cards.
  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0)
  const totalBudgeted = budgets.reduce((s, b) => s + b.limit, 0)

  // Transforms the grouped spending data into the format the pie chart component expects.
  const chartData = Object.entries(spentByCategory).map(([category, amount]) => ({
    category,
    amount,
  }))

  // Pairs each budget with how much has been spent in that category for the progress bars.
  const budgetData = budgets.map((b) => ({
    category: b.category,
    limit: b.limit,
    spent: spentByCategory[b.category] ?? 0,
  }))

  // Takes only the five most recent expenses and converts dates to strings for the client.
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
          {/* The month selector dropdown wrapped in Suspense to avoid blocking the page. */}
          <Suspense>
            <MonthPicker />
          </Suspense>
          <QuickAddButton />
        </div>
      </div>

      {/* The three stat cards showing total spent, total budgeted, and remaining budget. */}
      <SpendingOverview totalSpent={totalSpent} totalBudgeted={totalBudgeted} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* The pie chart showing spending broken down by category. */}
        <CategoryPieChart data={chartData} />
        {/* The list of the five most recent expenses with a link to see all. */}
        <RecentExpenses expenses={recentExpenses} month={month} />
      </div>

      {/* Budget progress bars only shown if the user has set at least one budget. */}
      {budgetData.length > 0 && <BudgetProgressBar budgets={budgetData} />}
    </div>
  )
}
