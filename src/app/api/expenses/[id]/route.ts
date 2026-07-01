// This API handles updating and deleting a single expense identified by its ID.
// Both endpoints verify the user is logged in and that the expense belongs to them
// before making any changes, so users cannot modify each other's data.

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { expenseSchema } from "@/lib/validations"

// Handles PUT requests to update an existing expense with new values.
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Rejects the request with a 401 error if the user is not logged in.
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Reads the expense ID from the URL path.
  const { id } = await params

  // Checks that the expense exists and belongs to the logged-in user.
  const expense = await db.expense.findUnique({ where: { id } })
  if (!expense || expense.userId !== session.user.id) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }

  // Parses and validates the updated expense data from the request body.
  const body = await request.json()
  const parsed = expenseSchema.safeParse(body)

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  // Saves the updated values to the database.
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

// Handles DELETE requests to permanently remove an expense.
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Rejects the request with a 401 error if the user is not logged in.
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Reads the expense ID from the URL path.
  const { id } = await params

  // Checks that the expense exists and belongs to the logged-in user.
  const expense = await db.expense.findUnique({ where: { id } })
  if (!expense || expense.userId !== session.user.id) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }

  // Deletes the expense from the database.
  await db.expense.delete({ where: { id } })
  return new Response(null, { status: 204 })
}
