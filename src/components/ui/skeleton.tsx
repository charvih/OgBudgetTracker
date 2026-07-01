// This file defines the Skeleton component used to show a loading placeholder.
// It displays an animated pulsing grey rectangle in the same position as content that
// is still loading, so the page layout does not jump when real content appears.

import { cn } from "@/lib/utils"

// Renders an animated grey block that pulses to indicate something is loading.
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }
