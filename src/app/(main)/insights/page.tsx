import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { insightSchema } from "@/lib/ai"
import { getCurrentMonth } from "@/lib/utils"
import { InsightsPanel } from "@/components/insights/InsightsPanel"

export const metadata = { title: "Insights — Budget Tracker" }

export default async function InsightsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const month = getCurrentMonth()
  const insight = await db.insight.findUnique({
    where: { userId_month: { userId: session.user.id, month } },
  })

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
      <InsightsPanel
        initialContent={initialContent}
        initialGeneratedAt={insight ? insight.generatedAt.toISOString() : null}
        initialMonth={month}
      />
    </div>
  )
}
