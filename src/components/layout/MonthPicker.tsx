"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { format } from "date-fns"
import { getCurrentMonth } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const monthOptions = Array.from({ length: 12 }, (_, i) => {
  const d = new Date()
  d.setDate(1)
  d.setMonth(d.getMonth() - i)
  return { val: format(d, "yyyy-MM"), label: format(d, "MMMM yyyy") }
})

export function MonthPicker() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const month = searchParams.get("month") ?? getCurrentMonth()

  return (
    <Select value={month} onValueChange={(val) => val && router.push(`?month=${val}`)}>
      <SelectTrigger className="w-44">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {monthOptions.map(({ val, label }) => (
          <SelectItem key={val} value={val}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
