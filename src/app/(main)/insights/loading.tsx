// This file shows a placeholder skeleton animation while the insights page is loading.
// It mimics the layout of the insight cards grid so the page does not jump when data appears.

import { Skeleton } from "@/components/ui/skeleton"

// Renders animated grey blocks matching the shape of the insights page layout.
export default function InsightsLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Placeholder for the month picker and generate button row. */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-9 w-36 rounded-xl" />
      </div>

      {/* Placeholder cards for the four insight sections arranged in a grid. */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-stone-200 bg-white shadow-sm p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-5 w-40" />
            </div>
            {/* Placeholder for two tip cards inside each section. */}
            {Array.from({ length: 2 }).map((_, j) => (
              <Skeleton key={j} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
