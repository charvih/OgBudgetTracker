import { auth } from "@/auth"
import { db } from "@/lib/db"
import { expenseSchema } from "@/lib/validations"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  const expense = await db.expense.findUnique({ where: { id } })
  if (!expense || expense.userId !== session.user.id) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }

  const body = await request.json()
  const parsed = expenseSchema.safeParse(body)

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const updated = await db.expense.update({
    where: { id },
    data: {
      amount: parsed.data.amount,
      category: parsed.data.category,
      date: new Date(parsed.data.date),
      description: parsed.data.description,
    },
  })

  return Response.json(updated)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  const expense = await db.expense.findUnique({ where: { id } })
  if (!expense || expense.userId !== session.user.id) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }

  await db.expense.delete({ where: { id } })
  return new Response(null, { status: 204 })
}
