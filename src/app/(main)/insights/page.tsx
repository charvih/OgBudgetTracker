import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import type { InsightContent } from "@/lib/ai"
import { InsightsPanel } from "@/components/insights/InsightsPanel"

export const metadata = { title: "Insights — Budget Tracker" }

export default async function InsightsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const insight = await db.insight.findUnique({ where: { userId: session.user.id } })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-800">AI Insights</h1>
        <p className="text-stone-500 text-sm mt-1">
          Personalised financial tips powered by Claude AI
        </p>
      </div>
      <InsightsPanel
        initialContent={insight ? (insight.content as InsightContent) : null}
        initialGeneratedAt={insight ? insight.generatedAt.toISOString() : null}
      />
    </div>
  )
}
