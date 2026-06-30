"use client"

import { useState } from "react"
import { toast } from "sonner"
import { formatRelativeTime } from "@/lib/utils"
import { TipCard } from "./TipCard"
import type { InsightContent } from "@/lib/ai"

interface InsightsPanelProps {
  initialContent: InsightContent | null
  initialGeneratedAt: string | null
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

export function InsightsPanel({ initialContent, initialGeneratedAt }: InsightsPanelProps) {
  const [content, setContent] = useState<InsightContent | null>(initialContent)
  const [generatedAt, setGeneratedAt] = useState<string | null>(initialGeneratedAt)
  const [loading, setLoading] = useState(false)

  async function generate(force = false) {
    setLoading(true)
    try {
      const url = force ? "/api/insights?force=true" : "/api/insights"
      const res = await fetch(url, { method: "POST" })
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
      <div className="flex items-center justify-between">
        <div>
          {generatedAt && (
            <p className="text-sm text-stone-500">
              Last updated {formatRelativeTime(generatedAt)}
            </p>
          )}
        </div>
        <button
          onClick={() => generate(!!content)}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-rose-500 px-4 py-2 text-sm font-medium text-white hover:bg-rose-600 disabled:opacity-60 transition-colors"
        >
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Generating…
            </>
          ) : content ? (
            "Refresh Insights"
          ) : (
            "Generate Insights"
          )}
        </button>
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
            Click "Generate Insights" to get personalised financial tips from Claude AI.
          </p>
        </div>
      )}
    </div>
  )
}
