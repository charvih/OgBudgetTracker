// This component shows three summary cards at the top of the dashboard.
// It displays the total amount spent, the total budget set, and how much is left
// (or how much is over budget), with colour coding to indicate the user's financial health.

import { formatCurrency } from "@/lib/utils"

interface SpendingOverviewProps {
  totalSpent: number
  totalBudgeted: number
}

// Renders the three stat cards showing total spent, total budgeted, and remaining amount.
export function SpendingOverview({ totalSpent, totalBudgeted }: SpendingOverviewProps) {
  // Calculates how much budget is left, which is negative if the user has gone over.
  const remaining = totalBudgeted - totalSpent
  // Calculates what percentage of the budget has been used, or null if no budget is set.
  const pct = totalBudgeted > 0 ? Math.round((totalSpent / totalBudgeted) * 100) : null

  // Picks the colour for the remaining card based on how close to the limit the user is.
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
      {/* Card showing the total amount spent this month. */}
      <div className="rounded-2xl bg-white border border-stone-200 shadow-sm p-5">
        <p className="text-sm text-stone-500 font-medium">Total Spent</p>
        <p className="text-2xl font-bold text-stone-800 mt-1">{formatCurrency(totalSpent)}</p>
        <p className="text-xs text-stone-400 mt-1">this month</p>
      </div>

      {/* Card showing the total budget across all categories that have a limit set. */}
      <div className="rounded-2xl bg-white border border-stone-200 shadow-sm p-5">
        <p className="text-sm text-stone-500 font-medium">Total Budgeted</p>
        <p className="text-2xl font-bold text-stone-800 mt-1">
          {totalBudgeted > 0 ? formatCurrency(totalBudgeted) : "—"}
        </p>
        <p className="text-xs text-stone-400 mt-1">across all categories</p>
      </div>

      {/* Card showing remaining budget in green, amber, or red depending on usage. */}
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
