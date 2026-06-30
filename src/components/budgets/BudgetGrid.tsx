"use client"

import { useState, useRef } from "react"
import { toast } from "sonner"
import { CATEGORY_EMOJI, formatCurrency } from "@/lib/utils"
import type { Category } from "@/lib/utils"

interface BudgetCardData {
  category: Category
  spent: number
  limit: number | null
}

interface BudgetGridProps {
  data: BudgetCardData[]
  month: string
}

export function BudgetGrid({ data, month }: BudgetGridProps) {
  const [limits, setLimits] = useState<Record<string, string>>(() =>
    Object.fromEntries(data.map((d) => [d.category, d.limit != null ? String(d.limit) : ""]))
  )
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  async function doSave(category: Category, raw: string) {
    setSaving((s) => ({ ...s, [category]: true }))
    try {
      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, limit: Number(raw), month }),
      })
      if (!res.ok) throw new Error()
      toast.success(`${category} budget saved`)
    } catch {
      toast.error("Failed to save budget")
    } finally {
      setSaving((s) => ({ ...s, [category]: false }))
    }
  }

  function handleBlur(category: Category) {
    const raw = limits[category].trim()
    if (!raw || Number(raw) <= 0) return

    clearTimeout(saveTimers.current[category])
    saveTimers.current[category] = setTimeout(() => void doSave(category, raw), 300)
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.map((d) => {
        const limitVal = Number(limits[d.category]) || null
        const pct = limitVal ? (d.spent / limitVal) * 100 : null

        const barColor =
          pct == null ? "bg-stone-200" :
          pct >= 100 ? "bg-rose-500" :
          pct >= 75 ? "bg-amber-400" :
          "bg-emerald-500"

        const spendColor =
          pct == null ? "text-stone-500" :
          pct >= 100 ? "text-rose-600" :
          pct >= 75 ? "text-amber-600" :
          "text-emerald-600"

        return (
          <div
            key={d.category}
            className="rounded-2xl border border-stone-200 bg-white shadow-sm p-5 space-y-4"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{CATEGORY_EMOJI[d.category]}</span>
              <div>
                <h3 className="font-semibold text-stone-800 text-sm">{d.category}</h3>
                <p className={`text-xs font-medium ${spendColor}`}>
                  {formatCurrency(d.spent)} spent
                  {limitVal != null ? ` of ${formatCurrency(limitVal)}` : ""}
                </p>
              </div>
            </div>

            {limitVal != null && pct != null && (
              <div className="h-1.5 rounded-full bg-stone-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${barColor}`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs text-stone-500 font-medium">Monthly limit</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">
                  $
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={limits[d.category]}
                  onChange={(e) =>
                    setLimits((l) => ({ ...l, [d.category]: e.target.value }))
                  }
                  onBlur={() => handleBlur(d.category)}
                  placeholder="No limit set"
                  disabled={saving[d.category]}
                  className="w-full pl-7 pr-3 py-2 text-sm rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent disabled:opacity-50"
                />
              </div>
              {pct != null && pct >= 100 && limitVal != null && (
                <p className="text-xs text-rose-500 font-medium">
                  {formatCurrency(d.spent - limitVal)} over budget
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
