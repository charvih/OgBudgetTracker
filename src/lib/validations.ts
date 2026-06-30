import { z } from "zod"
import { CATEGORIES } from "./utils"

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export const expenseSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  category: z.enum(CATEGORIES, { message: "Invalid category" }),
  date: z.string().min(1, "Date is required").refine(
    (val) => val <= new Date().toISOString().slice(0, 10),
    "Date cannot be in the future"
  ),
  description: z.string().max(200, "Description must be under 200 characters").optional().default(""),
})

export const budgetSchema = z.object({
  category: z.enum(CATEGORIES, { message: "Invalid category" }),
  limit: z.coerce.number().positive("Limit must be greater than 0"),
  month: z.string().regex(/^\d{4}-\d{2}$/, "Month must be in YYYY-MM format"),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ExpenseInput = z.infer<typeof expenseSchema>
export type BudgetInput = z.infer<typeof budgetSchema>
