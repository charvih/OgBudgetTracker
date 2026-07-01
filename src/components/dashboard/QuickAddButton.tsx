// This component renders the "Add Expense" button on the dashboard.
// Clicking it opens a popup form where the user can quickly log a new expense
// without navigating away from the dashboard.

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ExpenseForm } from "@/components/expenses/ExpenseForm"
import type { ExpenseInput } from "@/lib/validations"

// Renders the button and the popup form for adding a new expense from the dashboard.
export function QuickAddButton() {
  // Controls whether the add expense popup is open or closed.
  const [open, setOpen] = useState(false)
  const router = useRouter()

  // Sends the new expense to the API and refreshes the page to show the updated data.
  async function handleAdd(data: ExpenseInput) {
    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      toast.error("Failed to add expense")
      return
    }
    toast.success("Expense added")
    setOpen(false)
    // Refreshes the current page data without a full browser reload.
    router.refresh()
  }

  return (
    <>
      {/* The rose-coloured button that opens the add expense dialog. */}
      <Button
        onClick={() => setOpen(true)}
        className="bg-rose-500 hover:bg-rose-600 text-white"
      >
        <Plus className="h-4 w-4 mr-1.5" />
        Add Expense
      </Button>

      {/* The popup dialog containing the expense form. */}
      <Dialog open={open} onOpenChange={(open) => setOpen(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
            <DialogDescription>Record a new expense to your account.</DialogDescription>
          </DialogHeader>
          <ExpenseForm onSubmit={handleAdd} submitLabel="Add Expense" />
        </DialogContent>
      </Dialog>
    </>
  )
}
