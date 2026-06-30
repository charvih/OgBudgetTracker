import { auth } from "@/auth"
import { db } from "@/lib/db"
import { expenseSchema } from "@/lib/validations"
import { getMonthRange } from "@/lib/calculations"

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const month = searchParams.get("month")

  let dateFilter = {}
  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const { monthStart, monthEnd } = getMonthRange(month)
    dateFilter = { date: { gte: monthStart, lt: monthEnd } }
  }

  const expenses = await db.expense.findMany({
    where: { userId: session.user.id, ...dateFilter },
    orderBy: { date: "desc" },
  })

  return Response.json(expenses)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const parsed = expenseSchema.safeParse(body)

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const { amount, category, date, description } = parsed.data

  const expense = await db.expense.create({
    data: {
      amount,
      category,
      date: new Date(date),
      description,
      userId: session.user.id,
    },
  })

  return Response.json(expense, { status: 201 })
}
