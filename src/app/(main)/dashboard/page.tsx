export const metadata = { title: "Dashboard — Budget Tracker" }

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-800">Dashboard</h1>
        <p className="text-stone-500 text-sm mt-1">Your spending overview</p>
      </div>
      <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-sm">
        <p className="text-4xl mb-3">📊</p>
        <p className="text-stone-500 font-medium">Dashboard coming in Phase 4</p>
        <p className="text-stone-400 text-sm mt-1">
          Head to{" "}
          <a href="/expenses" className="text-rose-500 hover:underline">
            Expenses
          </a>{" "}
          to start tracking your spending.
        </p>
      </div>
    </div>
  )
}
