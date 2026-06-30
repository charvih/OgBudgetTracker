import { formatCurrency, formatDate, CATEGORY_EMOJI } from "@/lib/utils"
import type { Category } from "@/lib/utils"

interface Expense {
  id: string
  amount: number
  category: string
  date: string
  description: string
}

interface RecentExpensesProps {
  expenses: Expense[]
}

export function RecentExpenses({ expenses }: RecentExpensesProps) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-stone-800">Recent Expenses</h2>
        <a href="/expenses" className="text-xs text-rose-500 hover:underline font-medium">
          View all →
        </a>
      </div>

      {expenses.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-center space-y-2">
          <p className="text-3xl">📭</p>
          <p className="text-stone-500 font-medium">No expenses yet</p>
          <p className="text-stone-400 text-sm">Click &quot;Add Expense&quot; to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {expenses.map((expense) => (
            <div key={expense.id} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xl shrink-0">
                  {CATEGORY_EMOJI[expense.category as Category] ?? "📦"}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-stone-700 truncate">
                    {expense.description || expense.category}
                  </p>
                  <p className="text-xs text-stone-400">{formatDate(expense.date)}</p>
                </div>
              </div>
              <span className="text-sm font-semibold text-stone-800 shrink-0">
                {formatCurrency(expense.amount)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
