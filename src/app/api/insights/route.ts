import { auth } from "@/auth"
import { db } from "@/lib/db"
import { generateInsights } from "@/lib/ai"
import { getCurrentMonth } from "@/lib/utils"

const SIX_HOURS = 6 * 60 * 60 * 1000

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const insight = await db.insight.findUnique({ where: { userId: session.user.id } })
  if (!insight) return Response.json(null)

  return Response.json({ content: insight.content, generatedAt: insight.generatedAt })
}

export async function DELETE() {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

  await db.insight.deleteMany({ where: { userId: session.user.id } })
  return new Response(null, { status: 204 })
}

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const userId = session.user.id
  const existing = await db.insight.findUnique({ where: { userId } })

  if (existing && Date.now() - existing.generatedAt.getTime() < SIX_HOURS) {
    return Response.json({ content: existing.content, generatedAt: existing.generatedAt })
  }

  const month = getCurrentMonth()
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)

  const [expenses, budgets] = await Promise.all([
    db.expense.findMany({
      where: { userId, date: { gte: ninetyDaysAgo } },
      select: { amount: true, category: true, date: true, description: true },
      orderBy: { date: "desc" },
    }),
    db.budget.findMany({
      where: { userId, month },
      select: { category: true, limit: true, month: true },
    }),
  ])

  const content = await generateInsights(expenses, budgets)

  const insight = await db.insight.upsert({
    where: { userId },
    update: { content, generatedAt: new Date() },
    create: { userId, content },
  })

  return Response.json({ content: insight.content, generatedAt: insight.generatedAt })
}
