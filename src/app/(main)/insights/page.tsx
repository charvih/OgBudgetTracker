// This page shows AI-powered financial tips and spending analysis for the current month.
// It checks if the user already has cached insights in the database and passes them to
// the InsightsPanel, which lets the user generate fresh insights on demand.

import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { insightSchema } from "@/lib/ai"
import { getCurrentMonth } from "@/lib/utils"
import { InsightsPanel } from "@/components/insights/InsightsPanel"

export const metadata = { title: "Insights — Budget Tracker" }

// Loads any existing cached insights and renders the insights page.
export default async function InsightsPage() {
  // Checks the session and redirects to login if the user is not signed in.
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const month = getCurrentMonth()
  // Looks for an existing cached insight record for this user and month.
  const insight = await db.insight.findUnique({
    where: { userId_month: { userId: session.user.id, month } },
  })

  // Validates the stored insight data before passing it to the component.
  const parsed = insight ? insightSchema.safeParse(insight.content) : null
  const initialContent = parsed?.success ? parsed.data : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-800">AI Insights</h1>
        <p className="text-stone-500 text-sm mt-1">
          Personalised financial tips and spending analysis
        </p>
      </div>
      {/* Passes any existing cached insights so the panel can show them without a new API call. */}
      <InsightsPanel
        initialContent={initialContent}
        initialGeneratedAt={insight ? insight.generatedAt.toISOString() : null}
        initialMonth={month}
      />
    </div>
  )
}
