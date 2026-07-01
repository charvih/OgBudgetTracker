// This page shows all the user's expenses for the selected month in a filterable table.
// It loads expenses from the database on the server and passes them to the ExpenseList
// component, which handles adding, editing, and deleting expenses on the client side.

import { Suspense } from "react"
import { redirect } from "next/navigation"
import { format } from "date-fns"
import { db } from "@/lib/db"
import { getCurrentMonth } from "@/lib/utils"
import { getSession } from "@/lib/session"
import { getMonthRange } from "@/lib/calculations"
import { ExpenseList } from "@/components/expenses/ExpenseList"
import { MonthPicker } from "@/components/layout/MonthPicker"

export const metadata = { title: "Expenses — Budget Tracker" }

// Fetches expenses for the selected month and renders the expenses page.
export default async function ExpensesPage({
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

  // Fetches only the fields needed from the database to avoid loading unnecessary data.
  const expenses = await db.expense.findMany({
    where: { userId: session.user.id, date: { gte: monthStart, lt: monthEnd } },
    orderBy: { date: "desc" },
    select: { id: true, amount: true, category: true, date: true, description: true },
  })

  // Converts Date objects to ISO strings because client components cannot receive Date objects.
  const initialExpenses = expenses.map((e) => ({
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
          <h1 className="text-2xl font-bold text-stone-800">Expenses</h1>
          <p className="text-stone-500 text-sm mt-1">
            {format(monthStart, "MMMM yyyy")} — manage your spending
          </p>
        </div>
        {/* The month selector dropdown wrapped in Suspense to avoid blocking the page. */}
        <Suspense>
          <MonthPicker />
        </Suspense>
      </div>
      {/* The interactive expense table — key forces a full re-render when the month changes. */}
      <ExpenseList key={month} initialExpenses={initialExpenses} month={month} />
    </div>
  )
}
