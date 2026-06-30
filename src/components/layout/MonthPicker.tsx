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

const monthOptions = getMonthOptions()

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
