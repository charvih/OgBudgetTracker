import { formatCurrency } from "@/lib/utils"

interface SpendingOverviewProps {
  totalSpent: number
  totalBudgeted: number
}

export function SpendingOverview({ totalSpent, totalBudgeted }: SpendingOverviewProps) {
  const remaining = totalBudgeted - totalSpent
  const pct = totalBudgeted > 0 ? Math.round((totalSpent / totalBudgeted) * 100) : null

  const remainingColor =
    pct === null
      ? "text-stone-800"
      : remaining < 0
      ? "text-rose-500"
      : pct >= 75
      ? "text-amber-500"
      : "text-emerald-500"

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="rounded-2xl bg-white border border-stone-200 shadow-sm p-5">
        <p className="text-sm text-stone-500 font-medium">Total Spent</p>
        <p className="text-2xl font-bold text-stone-800 mt-1">{formatCurrency(totalSpent)}</p>
        <p className="text-xs text-stone-400 mt-1">this month</p>
      </div>

      <div className="rounded-2xl bg-white border border-stone-200 shadow-sm p-5">
        <p className="text-sm text-stone-500 font-medium">Total Budgeted</p>
        <p className="text-2xl font-bold text-stone-800 mt-1">
          {totalBudgeted > 0 ? formatCurrency(totalBudgeted) : "—"}
        </p>
        <p className="text-xs text-stone-400 mt-1">across all categories</p>
      </div>

      <div className="rounded-2xl bg-white border border-stone-200 shadow-sm p-5">
        <p className="text-sm text-stone-500 font-medium">
          {remaining < 0 ? "Over Budget" : "Remaining"}
        </p>
        <p className={`text-2xl font-bold mt-1 ${remainingColor}`}>
          {totalBudgeted > 0 ? formatCurrency(Math.abs(remaining)) : "—"}
        </p>
        <p className="text-xs text-stone-400 mt-1">
          {pct !== null ? `${pct}% of budget used` : "Set budgets to track"}
        </p>
      </div>
    </div>
  )
}
