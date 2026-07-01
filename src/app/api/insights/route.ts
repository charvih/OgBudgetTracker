// This API manages AI-generated financial insights for the logged-in user.
// GET fetches cached insights, DELETE clears them so fresh ones can be generated,
// and POST triggers the AI to generate new insights while preventing duplicate calls.

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { generateInsights } from "@/lib/ai"
import { getCurrentMonth } from "@/lib/utils"

// Six hours in milliseconds — the minimum time before cached insights can be refreshed.
const SIX_HOURS = 6 * 60 * 60 * 1000

// Handles GET requests to retrieve previously generated insights from the database.
export async function GET(req: Request) {
  // Rejects the request with a 401 error if the user is not logged in.
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

  // Reads the month from the query string, defaulting to the current month.
  const { searchParams } = new URL(req.url)
  const month = searchParams.get("month") || getCurrentMonth()

  // Looks up any existing insight record for this user and month.
  const insight = await db.insight.findUnique({ where: { userId_month: { userId: session.user.id, month } } })
  if (!insight) return Response.json(null)

  return Response.json({ content: insight.content, generatedAt: insight.generatedAt })
}

// Handles DELETE requests to clear cached insights so new ones can be generated.
export async function DELETE(req: Request) {
  // Rejects the request with a 401 error if the user is not logged in.
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

  // Reads the month from the query string, defaulting to the current month.
  const { searchParams } = new URL(req.url)
  const month = searchParams.get("month") || getCurrentMonth()

  // Removes any cached insight records for this user and month.
  await db.insight.deleteMany({ where: { userId: session.user.id, month } })
  return new Response(null, { status: 204 })
}

// Handles POST requests to generate fresh AI insights for the user's spending data.
export async function POST(req: Request) {
  // Rejects the request with a 401 error if the user is not logged in.
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const userId = session.user.id
  const body = await req.json().catch(() => ({}))
  const month: string = body.month || getCurrentMonth()

  // Checks if a recent insight already exists within the six-hour window.
  const existing = await db.insight.findUnique({ where: { userId_month: { userId, month } } })

  // Returns the cached result if it was generated less than six hours ago.
  if (existing && Date.now() - existing.generatedAt.getTime() < SIX_HOURS) {
    return Response.json({ content: existing.content, generatedAt: existing.generatedAt })
  }

  // Claims the slot in the database before calling the AI to prevent duplicate concurrent requests.
  await db.insight.upsert({
    where: { userId_month: { userId, month } },
    create: { userId, month, content: {}, generatedAt: new Date() },
    update: { generatedAt: new Date() },
  })

  // Converts the month string into a start and end date for database queries.
  const [startDate, endDate] = monthToDateRange(month)

  try {
    // Fetches the user's expenses and budgets for the selected month to send to the AI.
    const [expenses, budgets] = await Promise.all([
      db.expense.findMany({
        where: { userId, date: { gte: startDate, lt: endDate } },
        select: { amount: true, category: true, date: true, description: true },
        orderBy: { date: "desc" },
      }),
      db.budget.findMany({
        where: { userId, month },
        select: { category: true, limit: true, month: true },
      }),
    ])

    // Calls the Claude AI to analyse the expenses and budgets and get back insights.
    const content = await generateInsights(expenses, budgets)

    // Saves the AI's response to the database for caching.
    const insight = await db.insight.update({
      where: { userId_month: { userId, month } },
      data: { content },
    })

    return Response.json({ content: insight.content, generatedAt: insight.generatedAt })
  } catch {
    // If the AI call fails, resets the timestamp so the user can try again immediately.
    await db.insight.update({ where: { userId_month: { userId, month } }, data: { generatedAt: new Date(0) } })
    return Response.json({ error: "Failed to generate insights" }, { status: 500 })
  }
}

// Converts a "YYYY-MM" month string into a start date and the first day of the following month.
function monthToDateRange(month: string): [Date, Date] {
  const [year, m] = month.split("-").map(Number)
  const start = new Date(year, m - 1, 1)
  const end = new Date(year, m, 1)
  return [start, end]
}
