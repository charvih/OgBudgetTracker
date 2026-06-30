import type { ExpenseInput } from "@/lib/validations"

export type Expense = {
  id: string
  amount: number
  category: string
  date: string
  description: string
}

export async function fetchExpenses(month: string): Promise<Expense[]> {
  const res = await fetch(`/api/expenses?month=${month}`)
  if (!res.ok) throw new Error("Failed to fetch expenses")
  return res.json()
}

export async function createExpense(data: ExpenseInput): Promise<Expense> {
  const res = await fetch("/api/expenses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to create expense")
  return res.json()
}

export async function updateExpense(id: string, data: ExpenseInput): Promise<Expense> {
  const res = await fetch(`/api/expenses/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to update expense")
  return res.json()
}

export async function deleteExpense(id: string): Promise<void> {
  const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" })
  if (!res.ok) throw new Error("Failed to delete expense")
}
