"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Download } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { getCurrentMonth, formatCurrency, CATEGORY_EMOJI } from "@/lib/utils"
import type { Category } from "@/lib/utils"

type SummaryRow = {
  category: string
  spent: number
  budget: number | null
  variance: number | null
}

type TrendPoint = {
  month: string
  total: number
  label: string
}

type ReportData = {
  summary: SummaryRow[]
  trend: { month: string; total: number }[]
}

function exportCSV(rows: SummaryRow[], month: string) {
  const lines = [
    ["Category", "Spent (AUD)", "Budget (AUD)", "Variance (AUD)"],
    ...rows.map((r) => [
      r.category,
      r.spent.toFixed(2),
      r.budget !== null ? r.budget.toFixed(2) : "",
      r.variance !== null ? r.variance.toFixed(2) : "",
    ]),
  ]
  const csv = lines.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n")
  const blob = new Blob([csv], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `budget-report-${month}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function yAxisFormatter(v: number): string {
  if (v === 0) return "$0"
  if (v >= 1000) return `$${(v / 1000).toFixed(1)}k`
  return `$${v}`
}

export function ReportsPanel() {
  const [month, setMonth] = useState(getCurrentMonth())
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/reports?month=${month}`)
      .then((r) => r.json())
      .then((d: ReportData) => setData(d))
      .finally(() => setLoading(false))
  }, [month])

  const visibleRows = data?.summary.filter((r) => r.spent > 0 || r.budget !== null) ?? []

  const trendData: TrendPoint[] =
    data?.trend.map((t) => ({
      ...t,
      label: format(new Date(t.month + "-01"), "MMM"),
    })) ?? []

  const hasAnyBudget = visibleRows.some((r) => r.budget !== null)
  const totalSpent = visibleRows.reduce((s, r) => s + r.spent, 0)
  const totalBudget = visibleRows
    .filter((r) => r.budget !== null)
    .reduce((s, r) => s + (r.budget ?? 0), 0)
  const totalVariance = visibleRows
    .filter((r) => r.variance !== null)
    .reduce((s, r) => s + (r.variance ?? 0), 0)

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-stone-600">Month</label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-300"
          />
        </div>
        <button
          onClick={() => exportCSV(visibleRows, month)}
          disabled={visibleRows.length === 0}
          className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-40 transition-colors"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-stone-400 text-sm">
          Loading…
        </div>
      ) : (
        <>
          {/* Summary table */}
          <div className="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-stone-100">
              <h2 className="font-semibold text-stone-800">
                Category Summary — {format(new Date(month + "-01"), "MMMM yyyy")}
              </h2>
            </div>

            {visibleRows.length === 0 ? (
              <p className="px-5 py-10 text-center text-stone-400 text-sm">
                No expenses or budgets recorded for this month.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-100 text-stone-500 text-xs uppercase tracking-wide">
                    <th className="px-5 py-3 text-left font-medium">Category</th>
                    <th className="px-5 py-3 text-right font-medium">Spent</th>
                    <th className="px-5 py-3 text-right font-medium">Budget</th>
                    <th className="px-5 py-3 text-right font-medium">Variance</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((row) => (
                    <tr
                      key={row.category}
                      className="border-b border-stone-50 last:border-0 hover:bg-stone-50 transition-colors"
                    >
                      <td className="px-5 py-3 text-stone-800">
                        <span className="mr-2">
                          {CATEGORY_EMOJI[row.category as Category] ?? "📦"}
                        </span>
                        {row.category}
                      </td>
                      <td className="px-5 py-3 text-right text-stone-700 tabular-nums">
                        {formatCurrency(row.spent)}
                      </td>
                      <td className="px-5 py-3 text-right text-stone-500 tabular-nums">
                        {row.budget !== null ? formatCurrency(row.budget) : "—"}
                      </td>
                      <td
                        className={`px-5 py-3 text-right font-medium tabular-nums ${
                          row.variance === null
                            ? "text-stone-400"
                            : row.variance >= 0
                            ? "text-emerald-600"
                            : "text-rose-600"
                        }`}
                      >
                        {row.variance === null
                          ? "—"
                          : (row.variance >= 0 ? "+" : "") + formatCurrency(row.variance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-stone-50 font-semibold border-t border-stone-200">
                    <td className="px-5 py-3 text-stone-700">Total</td>
                    <td className="px-5 py-3 text-right text-stone-800 tabular-nums">
                      {formatCurrency(totalSpent)}
                    </td>
                    <td className="px-5 py-3 text-right text-stone-500 tabular-nums">
                      {hasAnyBudget ? formatCurrency(totalBudget) : "—"}
                    </td>
                    <td
                      className={`px-5 py-3 text-right tabular-nums ${
                        !hasAnyBudget
                          ? "text-stone-400"
                          : totalVariance >= 0
                          ? "text-emerald-600"
                          : "text-rose-600"
                      }`}
                    >
                      {hasAnyBudget
                        ? (totalVariance >= 0 ? "+" : "") + formatCurrency(totalVariance)
                        : "—"}
                    </td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>

          {/* 6-month trend chart */}
          <div className="rounded-2xl border border-stone-200 bg-white shadow-sm p-5">
            <h2 className="font-semibold text-stone-800 mb-4">6-Month Spending Trend</h2>
            {trendData.every((t) => t.total === 0) ? (
              <div className="flex flex-col items-center justify-center h-48 text-center space-y-2">
                <p className="text-3xl">📈</p>
                <p className="text-stone-500 font-medium">No spending data</p>
                <p className="text-stone-400 text-sm">Add expenses to see your trend</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={trendData} barSize={36}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12, fill: "#78716c" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#78716c" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={yAxisFormatter}
                    width={44}
                  />
                  <Tooltip
                    formatter={(value) =>
                      typeof value === "number"
                        ? [formatCurrency(value), "Spent"]
                        : [String(value), "Spent"]
                    }
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e7e5e4",
                      fontSize: "13px",
                    }}
                    cursor={{ fill: "#f5f5f4" }}
                  />
                  <Bar dataKey="total" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </>
      )}
    </div>
  )
}
