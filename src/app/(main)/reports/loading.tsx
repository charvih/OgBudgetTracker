// This file shows a placeholder skeleton animation while the reports page data is loading.
// It mimics the layout of the summary table and trend chart so the page looks stable while data loads.

import { Skeleton } from "@/components/ui/skeleton"

// Renders animated grey blocks matching the shape of the reports page layout.
export default function ReportsLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-4 w-52" />
      </div>

      {/* Placeholder for the export button and month picker row. */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-9 w-36 rounded-xl" />
        </div>
        <Skeleton className="h-9 w-28 rounded-xl" />
      </div>

      {/* Placeholder for the category summary table. */}
      <div className="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-100">
          <Skeleton className="h-5 w-56" />
        </div>
        <div className="p-4 space-y-3">
          {/* Placeholder rows for the category breakdown table. */}
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>

      {/* Placeholder for the six-month trend bar chart. */}
      <div className="rounded-2xl border border-stone-200 bg-white shadow-sm p-5 space-y-4">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-60 w-full rounded-xl" />
      </div>
    </div>
  )
}
