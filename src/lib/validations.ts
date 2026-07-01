// This file defines the rules that check whether user-submitted data is valid before
// it gets saved to the database. Each schema describes what a form field must look
// like — for example, requiring a positive number or a valid email address.

import { z } from "zod"
import { CATEGORIES } from "./utils"

// Rules for the registration form — name, email, and a password of at least 8 characters.
export const registerSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

// Rules for the login form — a valid email and a non-empty password.
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

// Rules for the expense form — amount must be positive, category must be from the fixed list,
// date cannot be in the future, and description is optional with a 200-character limit.
export const expenseSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  category: z.enum(CATEGORIES, { message: "Invalid category" }),
  date: z.string().min(1, "Date is required").refine(
    (val) => {
      // Builds today's date as a local string to compare against the submitted date.
      const now = new Date()
      const localToday = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
      return val <= localToday
    },
    "Date cannot be in the future"
  ),
  description: z.string().max(200, "Description must be under 200 characters").optional().default(""),
})

// Rules for the budget form — category from the fixed list, a positive limit, and a valid month string.
export const budgetSchema = z.object({
  category: z.enum(CATEGORIES, { message: "Invalid category" }),
  limit: z.coerce.number().positive("Limit must be greater than 0"),
  month: z.string().regex(/^\d{4}-\d{2}$/, "Month must be in YYYY-MM format"),
})

// TypeScript types inferred directly from the schemas so forms stay in sync with validation rules.
export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ExpenseInput = z.infer<typeof expenseSchema>
export type BudgetInput = z.infer<typeof budgetSchema>
