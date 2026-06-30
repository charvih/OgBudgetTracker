import { ExpenseList } from "@/components/expenses/ExpenseList"

export const metadata = { title: "Expenses — Budget Tracker" }

export default function ExpensesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-800">Expenses</h1>
        <p className="text-stone-500 text-sm mt-1">Manage your spending by month and category</p>
      </div>
      <ExpenseList />
    </div>
  )
}
