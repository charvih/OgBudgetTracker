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

type SectionConfig = {
  key: keyof InsightContent
  title: string
  icon: string
  variant: "tip" | "warning" | "danger" | "info"
  emptyText: string
}

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

function currentMonth() {
  return format(new Date(), "yyyy-MM")
}

export function InsightsPanel({ initialContent, initialGeneratedAt, initialMonth }: InsightsPanelProps) {
  const [month, setMonth] = useState(initialMonth)
  const [content, setContent] = useState<InsightContent | null>(initialContent)
  const [generatedAt, setGeneratedAt] = useState<string | null>(initialGeneratedAt)
  const [loading, setLoading] = useState(false)

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

  async function handleMonthChange(e: React.ChangeEvent<HTMLInputElement>) {
    const m = e.target.value
    setMonth(m)
    await fetchForMonth(m)
  }

  async function generate(isRefresh = false) {
    setLoading(true)
    try {
      if (isRefresh) {
        await fetch(`/api/insights?month=${month}`, { method: "DELETE" })
      }
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
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-stone-700" htmlFor="insight-month">
            Month
          </label>
          <input
            id="insight-month"
            type="month"
            value={month}
            max={currentMonth()}
            onChange={handleMonthChange}
            disabled={loading}
            className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm text-stone-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:opacity-50"
          />
          {generatedAt && (
            <p className="text-sm text-stone-500">
              Last updated {formatRelativeTime(generatedAt)}
            </p>
          )}
        </div>
        <Button
          onClick={() => generate(!!content)}
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
                {items.length === 0 ? (
                  <p className="text-sm text-stone-400 italic">{emptyText}</p>
                ) : (
                  <div className="space-y-2">
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
