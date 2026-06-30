import { auth } from "@/auth"
import { db } from "@/lib/db"
import { budgetSchema } from "@/lib/validations"
import { getCurrentMonth } from "@/lib/utils"

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const month = searchParams.get("month") ?? getCurrentMonth()

  const budgets = await db.budget.findMany({
    where: { userId: session.user.id, month },
  })

  return Response.json(budgets)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const result = budgetSchema.safeParse(body)
  if (!result.success) return Response.json({ error: result.error.flatten() }, { status: 400 })

  const { category, limit, month } = result.data
  const userId = session.user.id

  const budget = await db.budget.upsert({
    where: { userId_category_month: { userId, category, month } },
    update: { limit },
    create: { userId, category, limit, month },
  })

  return Response.json(budget)
}
