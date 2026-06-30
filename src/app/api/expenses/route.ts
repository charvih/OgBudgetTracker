import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { expenseSchema } from "@/lib/validations"

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const month = searchParams.get("month")

  let dateFilter = {}
  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const [year, m] = month.split("-").map(Number)
    dateFilter = { date: { gte: new Date(year, m - 1, 1), lt: new Date(year, m, 1) } }
  }

  const expenses = await db.expense.findMany({
    where: { userId: session.user.id, ...dateFilter },
    orderBy: { date: "desc" },
  })

  return NextResponse.json(expenses)
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const parsed = expenseSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
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

  return NextResponse.json(expense, { status: 201 })
}
