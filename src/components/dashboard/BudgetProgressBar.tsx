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

export function BudgetProgressBar({ budgets }: BudgetProgressBarProps) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white shadow-sm p-6">
      <h2 className="font-semibold text-stone-800 mb-4">Budget Progress</h2>
      <div className="space-y-4">
        {budgets.map(({ category, limit, spent }) => {
          const pct = Math.min(Math.round((spent / limit) * 100), 100)
          const over = spent > limit
          const warn = !over && pct >= 75

          const barColor = over ? "bg-rose-500" : warn ? "bg-amber-400" : "bg-emerald-500"

          return (
            <div key={category}>
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="font-medium text-stone-700">
                  {CATEGORY_EMOJI[category as Category] ?? "📦"} {category}
                </span>
                <span className={over ? "text-rose-500 font-semibold" : "text-stone-500"}>
                  {formatCurrency(spent)} / {formatCurrency(limit)}
                </span>
              </div>
              <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${barColor}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
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
