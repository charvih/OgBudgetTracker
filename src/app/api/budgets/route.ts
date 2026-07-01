// This API handles reading and saving monthly budget limits for the logged-in user.
// GET returns the budgets for a given month, and POST creates or updates a budget limit
// for a specific category, overwriting any existing one for that month.

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { budgetSchema } from "@/lib/validations"
import { getCurrentMonth } from "@/lib/utils"

// Handles GET requests to fetch the user's budgets for a given month.
export async function GET(request: Request) {
  // Rejects the request with a 401 error if the user is not logged in.
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

  // Reads the month from the query string, defaulting to the current month.
  const { searchParams } = new URL(request.url)
  const month = searchParams.get("month") ?? getCurrentMonth()

  // Fetches all budgets for the logged-in user in the specified month.
  const budgets = await db.budget.findMany({
    where: { userId: session.user.id, month },
  })

  return Response.json(budgets)
}

// Handles POST requests to create or update a budget limit for a category and month.
export async function POST(request: Request) {
  // Rejects the request with a 401 error if the user is not logged in.
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

  // Parses and validates the submitted budget data.
  const body = await request.json()
  const result = budgetSchema.safeParse(body)
  if (!result.success) return Response.json({ error: result.error.flatten() }, { status: 400 })

  const { category, limit, month } = result.data
  const userId = session.user.id

  // Creates the budget if it does not exist, or updates the limit if it already does.
  const budget = await db.budget.upsert({
    where: { userId_category_month: { userId, category, month } },
    update: { limit },
    create: { userId, category, limit, month },
  })

  return Response.json(budget)
}
