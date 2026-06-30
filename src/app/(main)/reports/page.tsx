import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { ReportsPanel } from "@/components/reports/ReportsPanel"

export const metadata = { title: "Reports — Budget Tracker" }

export default async function ReportsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-800">Reports</h1>
        <p className="text-stone-500 text-sm mt-1">Monthly spending summary and trends</p>
      </div>
      <ReportsPanel />
    </div>
  )
}
