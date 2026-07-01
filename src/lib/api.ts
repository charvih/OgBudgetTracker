// This file contains browser-side functions that talk to the backend API to manage expenses.
// Each function sends an HTTP request and either returns the data or throws an error if
// something goes wrong — making it easy to call from any component in the app.

import type { ExpenseInput } from "@/lib/validations"

// Describes the shape of an expense object as returned by the API.
export type Expense = {
  id: string
  amount: number
  category: string
  date: string
  description: string
}

// Fetches all expenses for a given month from the server.
export async function fetchExpenses(month: string): Promise<Expense[]> {
  const res = await fetch(`/api/expenses?month=${month}`)
  if (!res.ok) throw new Error("Failed to fetch expenses")
  return res.json()
}

// Sends a new expense to the server to be saved in the database.
export async function createExpense(data: ExpenseInput): Promise<Expense> {
  const res = await fetch("/api/expenses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to create expense")
  return res.json()
}

// Sends updated expense details to the server to overwrite an existing expense.
export async function updateExpense(id: string, data: ExpenseInput): Promise<Expense> {
  const res = await fetch(`/api/expenses/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to update expense")
  return res.json()
}

// Asks the server to permanently delete the expense with the given ID.
export async function deleteExpense(id: string): Promise<void> {
  const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" })
  if (!res.ok) throw new Error("Failed to delete expense")
}
