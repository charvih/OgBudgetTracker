// This API handles reading and creating expenses for the logged-in user.
// GET returns a list of expenses filtered by month, and POST saves a new expense.
// Both endpoints check that the user is logged in before doing anything.

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { expenseSchema } from "@/lib/validations"
import { getMonthRange } from "@/lib/calculations"

// Handles GET requests to fetch the user's expenses, optionally filtered by month.
export async function GET(request: Request) {
  // Rejects the request with a 401 error if the user is not logged in.
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Reads the optional month filter from the URL query string.
  const { searchParams } = new URL(request.url)
  const month = searchParams.get("month")

  // Builds a date range filter only if a valid month string was provided.
  let dateFilter = {}
  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const { monthStart, monthEnd } = getMonthRange(month)
    dateFilter = { date: { gte: monthStart, lt: monthEnd } }
  }

  // Fetches the user's expenses sorted from newest to oldest.
  const expenses = await db.expense.findMany({
    where: { userId: session.user.id, ...dateFilter },
    orderBy: { date: "desc" },
  })

  return Response.json(expenses)
}

// Handles POST requests to create a new expense for the logged-in user.
export async function POST(request: Request) {
  // Rejects the request with a 401 error if the user is not logged in.
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Parses and validates the submitted expense data from the request body.
  const body = await request.json()
  const parsed = expenseSchema.safeParse(body)

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const { amount, category, date, description } = parsed.data

  // Saves the new expense to the database linked to the logged-in user.
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
