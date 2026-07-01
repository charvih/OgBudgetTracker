// This component renders a pie chart on the dashboard showing spending split by category.
// Each slice of the pie represents one category and is coloured differently, with a legend
// and tooltip so the user can see exact amounts when they hover over a slice.

"use client"

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { formatCurrency, CATEGORY_EMOJI } from "@/lib/utils"
import type { Category } from "@/lib/utils"

// The list of colours used for each pie slice, cycling if there are more categories than colours.
const COLORS = [
  "#f43f5e",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#3b82f6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#6366f1",
]

interface CategoryPieChartProps {
  data: { category: string; amount: number }[]
}

// Renders a pie chart of spending by category, or an empty state message if there is no data.
export function CategoryPieChart({ data }: CategoryPieChartProps) {
  // Shows a friendly empty state if there are no expenses to display.
  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white shadow-sm p-6">
        <h2 className="font-semibold text-stone-800 mb-4">Spending by Category</h2>
        <div className="flex flex-col items-center justify-center h-48 text-center space-y-2">
          <p className="text-3xl">📊</p>
          <p className="text-stone-500 font-medium">No spending yet</p>
          <p className="text-stone-400 text-sm">Add expenses to see your breakdown</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-stone-200 bg-white shadow-sm p-6">
      <h2 className="font-semibold text-stone-800 mb-4">Spending by Category</h2>
      {/* Makes the chart fill its container width while keeping a fixed height. */}
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            dataKey="amount"
            nameKey="category"
            cx="50%"
            cy="50%"
            outerRadius={90}
            stroke="none"
          >
            {/* Assigns a colour from the COLORS array to each pie slice. */}
            {data.map((entry, index) => (
              <Cell key={entry.category} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          {/* Shows the category name with its emoji and formatted dollar amount on hover. */}
          <Tooltip
            formatter={(value, name) => [
              typeof value === "number" ? formatCurrency(value) : String(value),
              `${CATEGORY_EMOJI[String(name) as Category] ?? ""} ${String(name)}`,
            ]}
          />
          {/* Renders the colour key below the chart with each category's emoji and name. */}
          <Legend
            formatter={(value: string) =>
              `${CATEGORY_EMOJI[value as Category] ?? ""} ${value}`
            }
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
