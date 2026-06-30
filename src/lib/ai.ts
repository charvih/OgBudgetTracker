import Anthropic from "@anthropic-ai/sdk"

const client = new Anthropic()

export type InsightContent = {
  tips: string[]
  overspend: string[]
  forgotten_subscriptions: string[]
  fraud_flags: string[]
}

type ExpenseData = {
  amount: number
  category: string
  date: Date | string
  description: string
}

type BudgetData = {
  category: string
  limit: number
  month: string
}

export async function generateInsights(
  expenses: ExpenseData[],
  budgets: BudgetData[],
): Promise<InsightContent> {
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

  const toolBlock = response.content[0] as Anthropic.ToolUseBlock
  return toolBlock.input as InsightContent
}
