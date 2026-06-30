"use client"

import { useState, useCallback } from "react"
import { format } from "date-fns"
import { Pencil, Trash2, Plus } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ExpenseForm } from "./ExpenseForm"
import { CATEGORIES, CATEGORY_EMOJI, formatCurrency, formatDate } from "@/lib/utils"
import { fetchExpenses, createExpense, updateExpense, deleteExpense } from "@/lib/api"
import type { Expense } from "@/lib/api"
import type { ExpenseInput } from "@/lib/validations"

interface ExpenseListProps {
  initialExpenses: Expense[]
  month: string
}

export function ExpenseList({ initialExpenses, month }: ExpenseListProps) {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses)
  const [loading, setLoading] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [addOpen, setAddOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Expense | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null)
  const [deleting, setDeleting] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      setExpenses(await fetchExpenses(month))
    } catch {
      toast.error("Could not load expenses")
    } finally {
      setLoading(false)
    }
  }, [month])

  const filtered =
    categoryFilter === "all" ? expenses : expenses.filter((e) => e.category === categoryFilter)

  async function handleAdd(data: ExpenseInput) {
    try {
      await createExpense(data)
      toast.success("Expense added")
      setAddOpen(false)
      refresh()
    } catch {
      toast.error("Failed to add expense")
    }
  }

  async function handleEdit(data: ExpenseInput) {
    if (!editTarget) return
    try {
      await updateExpense(editTarget.id, data)
      toast.success("Expense updated")
      setEditTarget(null)
      refresh()
    } catch {
      toast.error("Failed to update expense")
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteExpense(deleteTarget.id)
      toast.success("Expense deleted")
      setDeleteTarget(null)
      refresh()
    } catch {
      toast.error("Failed to delete expense")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <Select value={categoryFilter} onValueChange={(val) => val && setCategoryFilter(val)}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {CATEGORY_EMOJI[cat]} {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={() => setAddOpen(true)} className="bg-rose-500 hover:bg-rose-600 text-white">
          <Plus className="h-4 w-4 mr-1.5" />
          Add Expense
        </Button>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-stone-50 hover:bg-stone-50">
              <TableHead>Date</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                  <TableCell />
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12">
                  <div className="space-y-2">
                    <p className="text-3xl">📭</p>
                    <p className="text-stone-500 font-medium">No expenses found</p>
                    <p className="text-stone-400 text-sm">
                      {categoryFilter !== "all"
                        ? "Try changing the category filter"
                        : "Add your first expense to get started"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="text-stone-600 text-sm">{formatDate(expense.date)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="gap-1 font-normal">
                      {CATEGORY_EMOJI[expense.category as keyof typeof CATEGORY_EMOJI]}{" "}
                      {expense.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-stone-600 text-sm max-w-xs truncate">
                    {expense.description || (
                      <span className="text-stone-400 italic">No description</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-stone-800">
                    {formatCurrency(expense.amount)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 justify-end">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-stone-500 hover:text-violet-600 hover:bg-violet-50"
                        onClick={() => setEditTarget(expense)}
                        title="Edit expense"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-stone-500 hover:text-rose-600 hover:bg-rose-50"
                        onClick={() => setDeleteTarget(expense)}
                        title="Delete expense"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Expense */}
      <Dialog open={addOpen} onOpenChange={(open) => setAddOpen(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
            <DialogDescription>Record a new expense to your account.</DialogDescription>
          </DialogHeader>
          <ExpenseForm onSubmit={handleAdd} submitLabel="Add Expense" />
        </DialogContent>
      </Dialog>

      {/* Edit Expense */}
      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
            <DialogDescription>Update the details for this expense.</DialogDescription>
          </DialogHeader>
          {editTarget && (
            <ExpenseForm
              defaultValues={{
                amount: editTarget.amount,
                category: editTarget.category as ExpenseInput["category"],
                date: format(new Date(editTarget.date), "yyyy-MM-dd"),
                description: editTarget.description,
              }}
              onSubmit={handleEdit}
              submitLabel="Save Changes"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Expense</DialogTitle>
            <DialogDescription>
              This cannot be undone. Are you sure you want to delete this expense?
            </DialogDescription>
          </DialogHeader>
          {deleteTarget && (
            <div className="py-1 text-sm text-stone-600 space-y-1">
              <p>
                <span className="font-medium">Amount:</span>{" "}
                {formatCurrency(deleteTarget.amount)}
              </p>
              <p>
                <span className="font-medium">Category:</span> {deleteTarget.category}
              </p>
              <p>
                <span className="font-medium">Date:</span> {formatDate(deleteTarget.date)}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" disabled={deleting} onClick={handleDelete}>
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
