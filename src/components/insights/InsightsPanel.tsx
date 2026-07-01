// This component renders the AI insights panel on the Insights page.
// It shows a month picker and a button the user must click to generate or refresh their financial tips,
// then displays the results grouped into four sections: tips, overspending, subscriptions, and fraud flags.

"use client"

import { useState } from "react"
import { toast } from "sonner"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { formatRelativeTime } from "@/lib/utils"
import { TipCard } from "./TipCard"
import type { InsightContent } from "@/lib/ai"

interface InsightsPanelProps {
  initialContent: InsightContent | null
  initialGeneratedAt: string | null
  initialMonth: string
}

// Defines the four sections shown in the insights panel with their title, icon, and style.
type SectionConfig = {
  key: keyof InsightContent
  title: string
  icon: string
  variant: "tip" | "warning" | "danger" | "info"
  emptyText: string
}

// The configuration for each of the four insight sections displayed on the page.
const SECTIONS: SectionConfig[] = [
  {
    key: "tips",
    title: "Financial Tips",
    icon: "💡",
    variant: "tip",
    emptyText: "No tips available.",
  },
  {
    key: "overspend",
    title: "Overspending Alerts",
    icon: "⚠️",
    variant: "warning",
    emptyText: "You're within budget on all categories. Great work!",
  },
  {
    key: "forgotten_subscriptions",
    title: "Forgotten Subscriptions",
    icon: "🔔",
    variant: "info",
    emptyText: "No forgotten subscriptions detected.",
  },
  {
    key: "fraud_flags",
    title: "Fraud Alerts",
    icon: "🚨",
    variant: "danger",
    emptyText: "No suspicious activity detected.",
  },
]

// Returns the current month in "YYYY-MM" format for use as the default month value.
function currentMonth() {
  return format(new Date(), "yyyy-MM")
}

// Renders the month picker, generate button, and the four insight sections.
export function InsightsPanel({ initialContent, initialGeneratedAt, initialMonth }: InsightsPanelProps) {
  // Tracks the currently selected month for which insights are displayed.
  const [month, setMonth] = useState(initialMonth)
  // Stores the AI insights content to display in the cards.
  const [content, setContent] = useState<InsightContent | null>(initialContent)
  // Stores when the current insights were last generated, shown as a relative time.
  const [generatedAt, setGeneratedAt] = useState<string | null>(initialGeneratedAt)
  // Tracks whether an API call is currently in progress.
  const [loading, setLoading] = useState(false)

  // Fetches any existing cached insights for the selected month without triggering the AI.
  async function fetchForMonth(m: string) {
    setLoading(true)
    setContent(null)
    setGeneratedAt(null)
    try {
      const res = await fetch(`/api/insights?month=${m}`)
      if (res.ok) {
        const data = await res.json()
        if (data) {
          setContent(data.content)
          setGeneratedAt(data.generatedAt)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  // Updates the selected month and loads any existing insights for that month.
  async function handleMonthChange(e: React.ChangeEvent<HTMLInputElement>) {
    const m = e.target.value
    setMonth(m)
    await fetchForMonth(m)
  }

  // Calls the AI to generate new insights for the selected month.
  async function generate() {
    setLoading(true)
    try {
      // Calls the insights API endpoint which triggers the Claude AI.
      // The server enforces a 6-hour cache window and returns existing insights if they are fresh.
      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setContent(data.content)
      setGeneratedAt(data.generatedAt)
      toast.success("Insights generated")
    } catch {
      toast.error("Failed to generate insights — check your API key")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* The top bar with the month picker, last updated time, and the generate/refresh button. */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-stone-700" htmlFor="insight-month">
            Month
          </label>
          {/* The month input field for choosing which month's data the AI should analyse. */}
          <input
            id="insight-month"
            type="month"
            value={month}
            max={currentMonth()}
            onChange={handleMonthChange}
            disabled={loading}
            className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm text-stone-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:opacity-50"
          />
          {/* Shows how long ago the current insights were generated. */}
          {generatedAt && (
            <p className="text-sm text-stone-500">
              Last updated {formatRelativeTime(generatedAt)}
            </p>
          )}
        </div>
        {/* The button to generate insights for the first time, or refresh existing ones. */}
        <Button
          onClick={() => generate()}
          disabled={loading}
          className="bg-rose-500 hover:bg-rose-600"
        >
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
              Generating…
            </>
          ) : content ? (
            "Refresh Insights"
          ) : (
            "Generate Insights"
          )}
        </Button>
      </div>

      {content ? (
        // Renders the four insight sections in a two-column grid when insights are available.
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {SECTIONS.map(({ key, title, icon, variant, emptyText }) => {
            const items = content[key]
            return (
              <div
                key={key}
                className="rounded-2xl border border-stone-200 bg-white shadow-sm p-5 space-y-3"
              >
                <h3 className="font-semibold text-stone-800 flex items-center gap-2">
                  <span>{icon}</span>
                  {title}
                </h3>
                {/* Shows a placeholder message if the AI returned no items for this section. */}
                {items.length === 0 ? (
                  <p className="text-sm text-stone-400 italic">{emptyText}</p>
                ) : (
                  <div className="space-y-2">
                    {/* Renders each AI tip as a coloured TipCard. */}
                    {items.map((item, i) => (
                      <TipCard key={i} text={item} variant={variant} />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        // Shows a prompt to generate insights when no content exists yet.
        <div className="rounded-2xl border border-stone-200 bg-white shadow-sm p-12 text-center">
          <p className="text-4xl mb-3">🤖</p>
          <p className="text-stone-600 font-medium">No insights yet</p>
          <p className="text-stone-400 text-sm mt-1">
            Click "Generate Insights" to get personalised financial tips and spending analysis.
          </p>
        </div>
      )}
    </div>
  )
}
