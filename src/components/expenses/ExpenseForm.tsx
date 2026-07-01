// This component renders the form used to add or edit an expense.
// It validates all fields in real time and shows error messages under each field,
// and it can be pre-filled with existing values when editing an expense.

"use client"

import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { expenseSchema, type ExpenseInput } from "@/lib/validations"
import { CATEGORIES, CATEGORY_EMOJI } from "@/lib/utils"

interface ExpenseFormProps {
  defaultValues?: Partial<ExpenseInput>
  onSubmit: (data: ExpenseInput) => Promise<void>
  submitLabel?: string
}

// Renders the expense form with amount, category, date, and description fields.
export function ExpenseForm({ defaultValues, onSubmit, submitLabel = "Save" }: ExpenseFormProps) {
  // Sets up the form with Zod validation and pre-fills fields when editing an existing expense.
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseInput>({
    resolver: zodResolver(expenseSchema) as Resolver<ExpenseInput>,
    defaultValues: {
      amount: defaultValues?.amount,
      category: defaultValues?.category,
      // Defaults the date to today if no existing value is provided.
      date: defaultValues?.date ?? format(new Date(), "yyyy-MM-dd"),
      description: defaultValues?.description ?? "",
    },
  })

  // Watches the category field so the Select component stays in sync with the form state.
  const category = watch("category")

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Amount field — accepts decimal numbers in Australian dollars. */}
      <div className="space-y-1.5">
        <Label htmlFor="amount">Amount (AUD)</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="0.00"
          {...register("amount")}
        />
        {errors.amount && <p className="text-xs text-rose-500">{errors.amount.message}</p>}
      </div>

      {/* Category field — a dropdown restricted to the fixed list of allowed categories. */}
      <div className="space-y-1.5">
        <Label>Category</Label>
        <Select
          value={category}
          onValueChange={(val) =>
            setValue("category", val as ExpenseInput["category"], { shouldValidate: true })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {/* Renders one option per category with its emoji icon. */}
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {CATEGORY_EMOJI[cat]} {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && <p className="text-xs text-rose-500">{errors.category.message}</p>}
      </div>

      {/* Date field — limits the user to today or earlier so no future expenses can be added. */}
      <div className="space-y-1.5">
        <Label htmlFor="date">Date</Label>
        <Input id="date" type="date" max={format(new Date(), "yyyy-MM-dd")} {...register("date")} />
        {errors.date && <p className="text-xs text-rose-500">{errors.date.message}</p>}
      </div>

      {/* Description field — optional text the user can add to describe the expense. */}
      <div className="space-y-1.5">
        <Label htmlFor="description">Description (optional)</Label>
        <Input
          id="description"
          placeholder="e.g. Grocery run"
          {...register("description")}
        />
        {errors.description && <p className="text-xs text-rose-500">{errors.description.message}</p>}
      </div>

      {/* Submit button that shows "Saving…" while the request is in progress. */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-rose-500 hover:bg-rose-600 text-white"
      >
        {isSubmitting ? "Saving…" : submitLabel}
      </Button>
    </form>
  )
}
