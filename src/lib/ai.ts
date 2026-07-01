// This file connects to the Claude AI and asks it to analyse the user's spending data.
// It uses a special "tool use" technique so Claude returns a structured result that can
// be safely checked and stored, rather than just a block of free text.

import Anthropic from "@anthropic-ai/sdk"
import { z } from "zod"

// Creates the Claude AI client using the API key from the environment variables.
const client = new Anthropic()

// Describes the exact shape of the AI's response so it can be validated before being saved.
export const insightSchema = z.object({
  tips: z.array(z.string()),
  overspend: z.array(z.string()),
  forgotten_subscriptions: z.array(z.string()),
  fraud_flags: z.array(z.string()),
})

// A TypeScript type that matches the shape of AI insights returned by the schema above.
export type InsightContent = z.infer<typeof insightSchema>

// Describes what a single expense looks like when passed to the AI.
type ExpenseData = {
  amount: number
  category: string
  date: Date | string
  description: string
}

// Describes what a single budget looks like when passed to the AI.
type BudgetData = {
  category: string
  limit: number
  month: string
}

// Sends the user's expenses and budgets to Claude and gets back personalised financial advice.
export async function generateInsights(
  expenses: ExpenseData[],
  budgets: BudgetData[],
): Promise<InsightContent> {
  // Calls the Claude API, forcing it to use a structured tool so the response has a fixed shape.
  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    tools: [
      {
        name: "financial_analysis",
        description: "Analyze user expense data and budget limits to provide personalised financial insights",
        input_schema: {
          type: "object" as const,
          properties: {
            tips: {
              type: "array",
              items: { type: "string" },
              description: "2-4 actionable financial tips based on spending patterns",
            },
            overspend: {
              type: "array",
              items: { type: "string" },
              description: "Categories where the user is overspending relative to budget or unusually high",
            },
            forgotten_subscriptions: {
              type: "array",
              items: { type: "string" },
              description: "Potential recurring charges or forgotten subscriptions detected",
            },
            fraud_flags: {
              type: "array",
              items: { type: "string" },
              description: "Suspicious transaction patterns that may warrant review",
            },
          },
          required: ["tips", "overspend", "forgotten_subscriptions", "fraud_flags"],
        },
      },
    ],
    tool_choice: { type: "tool", name: "financial_analysis" },
    messages: [
      {
        role: "user",
        content: `Analyse this Australian user's financial data and provide insights.

Recent expenses:
${JSON.stringify(
  expenses.map((e) => ({
    amount: e.amount,
    category: e.category,
    date: typeof e.date === "string" ? e.date : (e.date as Date).toISOString().split("T")[0],
    description: e.description,
  })),
  null,
  2
)}

Monthly budgets:
${JSON.stringify(budgets, null, 2)}

Provide specific, actionable insights. If there are no expenses, provide general financial tips for Australians.`,
      },
    ],
  })

  // Finds the tool result block inside Claude's response.
  const toolBlock = response.content.find(
    (b): b is Anthropic.ToolUseBlock => b.type === "tool_use",
  )
  if (!toolBlock) throw new Error("Claude did not return a tool_use block")

  // Validates that the tool result matches the expected shape before returning it.
  return insightSchema.parse(toolBlock.input)
}
