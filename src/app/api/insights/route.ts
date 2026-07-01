import { auth } from "@/auth"
import { db } from "@/lib/db"
import { generateInsights } from "@/lib/ai"
import { getCurrentMonth } from "@/lib/utils"

const SIX_HOURS = 6 * 60 * 60 * 1000

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const month = searchParams.get("month") || getCurrentMonth()

  const insight = await db.insight.findUnique({ where: { userId_month: { userId: session.user.id, month } } })
  if (!insight) return Response.json(null)

  return Response.json({ content: insight.content, generatedAt: insight.generatedAt })
}

export async function DELETE(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const month = searchParams.get("month") || getCurrentMonth()

  await db.insight.deleteMany({ where: { userId: session.user.id, month } })
  return new Response(null, { status: 204 })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const userId = session.user.id
  const body = await req.json().catch(() => ({}))
  const month: string = body.month || getCurrentMonth()

  const existing = await db.insight.findUnique({ where: { userId_month: { userId, month } } })

  if (existing && Date.now() - existing.generatedAt.getTime() < SIX_HOURS) {
    return Response.json({ content: existing.content, generatedAt: existing.generatedAt })
  }

  // Claim the slot before calling AI to prevent concurrent duplicate requests
  await db.insight.upsert({
    where: { userId_month: { userId, month } },
    create: { userId, month, content: {}, generatedAt: new Date() },
    update: { generatedAt: new Date() },
  })

  // Expenses for the selected month only
  const [startDate, endDate] = monthToDateRange(month)

  try {
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

    const content = await generateInsights(expenses, budgets)

    const insight = await db.insight.update({
      where: { userId_month: { userId, month } },
      data: { content },
    })

    return Response.json({ content: insight.content, generatedAt: insight.generatedAt })
  } catch {
    await db.insight.update({ where: { userId_month: { userId, month } }, data: { generatedAt: new Date(0) } })
    return Response.json({ error: "Failed to generate insights" }, { status: 500 })
  }
}

function monthToDateRange(month: string): [Date, Date] {
  const [year, m] = month.split("-").map(Number)
  const start = new Date(year, m - 1, 1)
  const end = new Date(year, m, 1)
  return [start, end]
}
