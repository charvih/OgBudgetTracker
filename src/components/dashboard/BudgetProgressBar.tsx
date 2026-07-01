// This component shows a progress bar for each budget category on the dashboard.
// Each bar fills up as the user spends money and turns red when the budget limit is exceeded,
// giving a quick visual overview of which categories are on track or over budget.

import { formatCurrency, CATEGORY_EMOJI } from "@/lib/utils"
import type { Category } from "@/lib/utils"

interface BudgetItem {
  category: string
  limit: number
  spent: number
}

interface BudgetProgressBarProps {
  budgets: BudgetItem[]
}

// Renders a list of progress bars, one for each budget category that has a limit set.
export function BudgetProgressBar({ budgets }: BudgetProgressBarProps) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white shadow-sm p-6">
      <h2 className="font-semibold text-stone-800 mb-4">Budget Progress</h2>
      <div className="space-y-4">
        {/* Loops through each budget and renders a label, amounts, and a coloured progress bar. */}
        {budgets.map(({ category, limit, spent }) => {
          // Calculates the percentage spent, capped at 100 so the bar never overflows.
          const pct = Math.min(Math.round((spent / limit) * 100), 100)
          const over = spent > limit
          const warn = !over && pct >= 75

          // Picks the bar colour — red if over budget, amber if close, green if fine.
          const barColor = over ? "bg-rose-500" : warn ? "bg-amber-400" : "bg-emerald-500"

          return (
            <div key={category}>
              {/* The category name with emoji and the spent vs limit amounts. */}
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="font-medium text-stone-700">
                  {CATEGORY_EMOJI[category as Category] ?? "📦"} {category}
                </span>
                <span className={over ? "text-rose-500 font-semibold" : "text-stone-500"}>
                  {formatCurrency(spent)} / {formatCurrency(limit)}
                </span>
              </div>
              {/* The progress bar track with the coloured fill inside it. */}
              <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${barColor}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              {/* Shows how much over budget the user is if they have exceeded the limit. */}
              {over && (
                <p className="text-xs text-rose-500 mt-0.5">
                  {formatCurrency(spent - limit)} over budget
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
