// This component renders a grid of cards, one per spending category, on the Budgets page.
// Each card shows how much has been spent, lets the user type in a monthly limit, and displays
// a coloured progress bar that fills up as spending approaches or exceeds the limit.

"use client"

import React, { useState, useRef } from "react"
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

// Renders a responsive grid of budget cards with editable monthly limits and progress bars.
export function BudgetGrid({ data, month }: BudgetGridProps) {
  // Stores the current text value of each category's limit input field.
  const [limits, setLimits] = useState<Record<string, string>>(() =>
    Object.fromEntries(data.map((d) => [d.category, d.limit != null ? String(d.limit) : ""]))
  )
  // Tracks which category cards are currently saving to the server.
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  // Holds debounce timers so rapid typing does not trigger too many API calls.
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  // Sends the budget limit for a category to the API and shows a success or error toast.
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

  // Triggers a delayed save when the user leaves the limit input field, validating the value first.
  function handleBlur(category: Category) {
    const raw = limits[category].trim()
    if (!raw || isNaN(Number(raw)) || Number(raw) <= 0) return

    // Clears any pending save timer and starts a new 300ms delay to batch rapid changes.
    clearTimeout(saveTimers.current[category])
    saveTimers.current[category] = setTimeout(() => void doSave(category, raw), 300)
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Renders one card per category with its spending status and limit input. */}
      {data.map((d) => {
        const limitVal = Number(limits[d.category]) || null
        // Calculates how much of the limit has been used as a percentage.
        const pct = limitVal ? (d.spent / limitVal) * 100 : null

        // Picks the progress bar colour based on how much of the budget has been used.
        const barColor =
          pct == null ? "bg-stone-200" :
          pct >= 100 ? "bg-rose-500" :
          pct >= 75 ? "bg-amber-400" :
          "bg-emerald-500"

        // Picks the text colour for the spending amount to match the bar colour.
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
            {/* The category emoji, name, and current spending amount at the top of the card. */}
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

            {/* Shows the progress bar only when a limit has been set for this category. */}
            {limitVal != null && pct != null && (
              <div className="h-1.5 rounded-full bg-stone-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all w-[var(--bar-pct)] ${barColor}`}
                  style={{ "--bar-pct": `${Math.min(pct, 100)}%` } as React.CSSProperties}
                />
              </div>
            )}

            {/* The editable monthly limit input field at the bottom of the card. */}
            <div className="space-y-1">
              <label className="text-xs text-stone-500 font-medium">Monthly limit</label>
              <div className="relative">
                {/* The dollar sign prefix inside the input field. */}
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
              {/* Shows how much over budget the user is when spending exceeds the limit. */}
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
