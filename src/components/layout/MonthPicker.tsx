// This component renders a dropdown that lets the user pick which month to view.
// When a new month is selected, it updates the URL query string so the page
// reloads with data for the chosen month.

"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { getCurrentMonth } from "@/lib/utils"
import { getMonthOptions } from "@/lib/calculations"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Pre-builds the list of the last 12 months when the module loads.
const monthOptions = getMonthOptions()

// Renders the month selector dropdown linked to the page's URL query parameter.
export function MonthPicker() {
  const router = useRouter()
  // Reads the current month from the URL, defaulting to the current month.
  const searchParams = useSearchParams()
  const month = searchParams.get("month") ?? getCurrentMonth()

  return (
    // When the user picks a month, navigates to the same page with the new month in the URL.
    <Select value={month} onValueChange={(val) => val && router.push(`?month=${val}`)}>
      <SelectTrigger className="w-44">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {/* Renders a dropdown option for each of the last 12 months. */}
        {monthOptions.map(({ val, label }) => (
          <SelectItem key={val} value={val}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
