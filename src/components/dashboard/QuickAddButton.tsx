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

export function QuickAddButton() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

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
    router.refresh()
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="bg-rose-500 hover:bg-rose-600 text-white"
      >
        <Plus className="h-4 w-4 mr-1.5" />
        Add Expense
      </Button>

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
