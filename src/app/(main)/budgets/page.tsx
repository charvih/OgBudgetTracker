import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { format } from "date-fns"
import { db } from "@/lib/db"
import { CATEGORIES, getCurrentMonth } from "@/lib/utils"
import type { Category } from "@/lib/utils"
import { BudgetGrid } from "@/components/budgets/BudgetGrid"

export const metadata = { title: "Budgets — Budget Tracker" }

export default async function BudgetsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const userId = session.user.id
  const month = getCurrentMonth()
  const [year, mon] = month.split("-").map(Number)
  const monthStart = new Date(year, mon - 1, 1)
  const monthEnd = new Date(year, mon, 1)

  const [expenses, budgets] = await Promise.all([
    db.expense.findMany({ where: { userId, date: { gte: monthStart, lt: monthEnd } } }),
    db.budget.findMany({ where: { userId, month } }),
  ])

  const spentByCategory: Record<string, number> = {}
  for (const e of expenses) {
    spentByCategory[e.category] = (spentByCategory[e.category] ?? 0) + e.amount
  }

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
      <div>
        <h1 className="text-2xl font-bold text-stone-800">Budgets</h1>
        <p className="text-stone-500 text-sm mt-1">
          Set monthly limits for {format(monthStart, "MMMM yyyy")}
        </p>
      </div>
      <BudgetGrid data={data} month={month} />
    </div>
  )
}
