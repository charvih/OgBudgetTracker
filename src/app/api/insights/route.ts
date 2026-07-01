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

  // Claim the slot before calling AI — any concurrent request from the same user
  // will now see a fresh generatedAt and return early
  await db.insight.upsert({
    where: { userId },
    create: { userId, content: {}, generatedAt: new Date() },
    update: { generatedAt: new Date() },
  })

  const month = getCurrentMonth()
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)

  try {
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

    const insight = await db.insight.update({
      where: { userId },
      data: { content },
    })

    return Response.json({ content: insight.content, generatedAt: insight.generatedAt })
  } catch {
    // Reset so the user can retry rather than being locked out for 6 hours
    await db.insight.update({ where: { userId }, data: { generatedAt: new Date(0) } })
    return Response.json({ error: "Failed to generate insights" }, { status: 500 })
  }
}
