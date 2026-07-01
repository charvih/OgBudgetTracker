// This file shows a placeholder skeleton animation while the dashboard data is being loaded.
// It mirrors the layout of the real dashboard so the page does not jump around when content appears.

import { Skeleton } from "@/components/ui/skeleton"

// Renders grey animated blocks in the same positions as the real dashboard content.
export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="h-9 w-28 rounded-xl" />
      </div>

      {/* Placeholder for the three stat cards shown in a row. */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-stone-200 bg-white shadow-sm p-5 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>

      {/* Placeholder for the pie chart and recent expenses side by side. */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-stone-200 bg-white shadow-sm p-6 space-y-4">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white shadow-sm p-6 space-y-4">
          <Skeleton className="h-5 w-36" />
          {/* Placeholders for five recent expense rows. */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full shrink-0" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-16 shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
